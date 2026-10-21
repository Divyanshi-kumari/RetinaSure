"""RetinaSure API.

Checkpoint layout (verified from best_model.pt):
  model_state_dict keys = backbone.* (timm mobilevit_s, pooled 640-d)
                        + feature_head.0 Linear(640,256) + feature_head.1 LayerNorm(256)
                        + classifier Linear(256,5)
Two things cannot be read from the weights and are configurable (see verify.py):
  FEATURE_ACT  activation after the LayerNorm  (default gelu)
  NORM         input normalisation             (default imagenet; 'none' = cvnets 0/1)
"""
import base64, io, math, os, threading
from pathlib import Path

import numpy as np
import timm
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as T
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

CKPT_PATH = Path(os.getenv("CHECKPOINT", Path(__file__).with_name("best_model.pt")))
FEATURE_ACT = os.getenv("FEATURE_ACT", "gelu").lower()
NORM = os.getenv("NORM", "imagenet").lower()
MAX_BYTES = 10 * 1024 * 1024
ACTS = {"gelu": nn.GELU, "relu": nn.ReLU, "silu": nn.SiLU}
NORMS = {"imagenet": ([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]), "none": ([0, 0, 0], [1, 1, 1])}


class DRNet(nn.Module):
    def __init__(self, name: str, act: str = "gelu", n_classes: int = 5):
        super().__init__()
        self.backbone = timm.create_model(name, pretrained=False, num_classes=0)
        self.feature_head = nn.Sequential(
            nn.Linear(self.backbone.num_features, 256), nn.LayerNorm(256), ACTS[act](), nn.Dropout(0.0)
        )
        self.classifier = nn.Linear(256, n_classes)

    def forward(self, x):
        return self.classifier(self.feature_head(self.backbone(x)))


def load_model(act: str = FEATURE_ACT, path: Path = CKPT_PATH):
    ck = torch.load(path, map_location="cpu")
    model = DRNet(ck.get("model_name", "mobilevit_s.cvnets_in1k"), act)
    model.load_state_dict(ck["model_state_dict"], strict=True)
    return model.eval(), int(ck.get("image_size", 384)), ck.get("val_metrics")


def make_transform(size: int, norm: str = NORM):
    mean, std = NORMS[norm]
    return T.Compose([T.Resize((size, size)), T.ToTensor(), T.Normalize(mean, std)])


def jet(x: np.ndarray) -> np.ndarray:
    r = np.clip(1.5 - np.abs(4 * x - 3), 0, 1)
    g = np.clip(1.5 - np.abs(4 * x - 2), 0, 1)
    b = np.clip(1.5 - np.abs(4 * x - 1), 0, 1)
    return np.stack([r, g, b], -1)


def run(model, x: torch.Tensor, with_cam: bool = True):
    """Returns (probs list, gradcam data-URI or None). Grad-CAM targets backbone.final_conv."""
    store, handle = {}, None
    if with_cam:
        def hook(_m, _i, out):
            store["a"] = out
            out.register_hook(lambda g: store.__setitem__("g", g))
        handle = model.backbone.final_conv.register_forward_hook(hook)
    try:
        with torch.enable_grad() if with_cam else torch.no_grad():
            logits = model(x)
            probs = torch.softmax(logits, 1)[0]
            cam_uri = None
            if with_cam:
                try:
                    model.zero_grad()
                    logits[0, int(probs.argmax())].backward()
                    a, g = store["a"].detach(), store["g"]
                    cam = F.relu((g.mean((2, 3), keepdim=True) * a).sum(1, keepdim=True))
                    cam = F.interpolate(cam, size=x.shape[-2:], mode="bilinear", align_corners=False)[0, 0].numpy()
                    cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
                    cam_uri = cam
                except Exception:
                    cam_uri = None
    finally:
        if handle:
            handle.remove()
    return probs.detach().tolist(), cam_uri


def overlay_png(img: Image.Image, cam: np.ndarray, size: int) -> str:
    base = np.asarray(img.resize((size, size)), dtype=np.float32) / 255
    heat = jet(cam)
    alpha = (cam[..., None] * 0.6)
    out = (base * (1 - alpha) + heat * alpha)
    buf = io.BytesIO()
    Image.fromarray((out * 255).astype(np.uint8)).save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


app = FastAPI(title="RetinaSure API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_methods=["*"], allow_headers=["*"],
)

model, size, val_metrics, err, tf = None, 384, None, None, None
lock = threading.Lock()
try:
    model, size, val_metrics = load_model()
    tf = make_transform(size)
except Exception as e:
    model, err = None, f"{type(e).__name__}: {e}"


@app.get("/health")
def health():
    return {"model_loaded": model is not None, "error": err, "image_size": size,
            "feature_act": FEATURE_ACT, "norm": NORM, "checkpoint_val_metrics": val_metrics}


@app.post("/predict")
def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(503, f"Checkpoint not loaded: {err}")
    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image larger than 10 MB")
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Not a valid image")
    x = tf(img).unsqueeze(0)
    with lock:
        probs, cam = run(model, x)
    ent = -sum(p * math.log(p) for p in probs if p > 0) / math.log(len(probs))
    top2 = sorted(probs, reverse=True)[:2]
    return {
        "label": max(range(len(probs)), key=probs.__getitem__),
        "probabilities": probs,
        # Confidence-based only. MC dropout is NOT computed.
        "uncertainty": {"confidence": top2[0], "margin": top2[0] - top2[1], "normalized_entropy": ent},
        "gradcam": overlay_png(img, cam, size) if cam is not None else None,
    }

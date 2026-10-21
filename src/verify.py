"""Run:  python verify.py path/to/known_validation_image.jpg
Prints predictions for each (activation x normalisation) combo. Pick the combo that
reproduces what your notebook gives for the same image (e.g. the 99.59% No DR example),
then set FEATURE_ACT / NORM accordingly before starting the server."""
import sys, torch
from PIL import Image
from main import load_model, make_transform

img = Image.open(sys.argv[1]).convert("RGB")
for act in ("gelu", "relu", "silu"):
    model, size, _ = load_model(act)
    for norm in ("imagenet", "none"):
        x = make_transform(size, norm)(img).unsqueeze(0)
        with torch.no_grad():
            p = torch.softmax(model(x), 1)[0]
        print(f"act={act:5s} norm={norm:8s} -> class {int(p.argmax())}  "
              + " ".join(f"{v:.3f}" for v in p.tolist()))

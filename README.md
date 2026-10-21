# RetinaSure: Explainable and Uncertainty-Aware Diabetic Retinopathy Detection

RetinaSure is a deep learning research prototype for diabetic retinopathy (DR) severity grading using retinal fundus images from the APTOS 2019 dataset. The project explores model predictions, uncertainty estimation, visual explanations, and confidence calibration to support more transparent model evaluation.

> **Research disclaimer:** RetinaSure is an experimental research prototype, not a clinically validated diagnostic system. Its reported results are based on validation data and should not be interpreted as independent external-test performance or evidence of clinical readiness.

## Overview

Diabetic retinopathy is an eye disease associated with diabetes that can lead to vision impairment. Automated severity grading can help researchers investigate computer vision methods for retinal image analysis.

RetinaSure explores the following components:

- **Deep learning:** A MobileViT-S baseline for five-class diabetic retinopathy grading.
- **Uncertainty estimation:** Monte Carlo (MC) Dropout and prediction-based uncertainty measures.
- **Explainable AI:** Grad-CAM visualizations to inspect image regions influencing predictions.
- **Confidence calibration:** Exploratory temperature-scaling analysis.
- **Risk–coverage analysis:** Examination of prediction performance at different coverage levels.

The components do not all have the same experimental status. Prototype or graph-refinement ideas should not be interpreted as validated improvements unless supported by completed experiments.

## Dataset

The project uses the APTOS 2019 Blindness Detection dataset.

The five severity classes are:

| Label | Severity         |
| ----- | ---------------- |
| 0     | No DR            |
| 1     | Mild             |
| 2     | Moderate         |
| 3     | Severe           |
| 4     | Proliferative DR |

The labelled training set contains 3,662 images. A stratified split was used:

- Training: 2,929 images
- Validation: 733 images

The validation set is used for model evaluation. It is not an independent external test set.

**Dataset access:** Obtain the dataset through its official Kaggle competition page: [https://www.kaggle.com/competitions/aptos2019-blindness-detection](https://www.kaggle.com/competitions/aptos2019-blindness-detection)

Please follow the dataset's applicable terms and conditions.

## Model and Implementation

- **Backbone:** MobileViT-S (`mobilevit_s.cvnets_in1k`)
- **Input resolution:** 384 × 384 pixels
- **Framework:** PyTorch
- **Training environment:** Kaggle notebook environment with a Tesla T4 GPU
- **Task:** Five-class image classification

The implementation includes a pretrained baseline and class-weighted training. Refer to the actual notebook and saved configuration files for the complete experimental setup.

## Evaluation and Analysis

The project investigates:

1. Classification performance on the validation split.
2. Class-wise performance and confusion patterns.
3. Prediction uncertainty using MC Dropout.
4. Grad-CAM-based visual explanations.
5. Exploratory calibration metrics, including Expected Calibration Error (ECE) and Brier score.
6. Risk–coverage behaviour.

### Interpreting the results

Calibration and uncertainty analyses must be interpreted separately from classification accuracy. Temperature scaling did not improve the reported exploratory calibration metrics in the current experiments. Proposed prototype-bank or graph-refinement components have not been demonstrated to improve performance.

Use the saved validation metrics, training history, and result artifacts to report the exact numbers for a particular experiment. Do not treat preliminary or intermediate results as final results.

## Repository Contents

The repository may contain the following components, depending on which project files are included:

- `README.md` — project overview and instructions
- `notebooks/` — training and evaluation notebook, if included
- `src/` — source code and configuration files, if included
- `results/` — confusion matrices, Grad-CAM visualizations, risk–coverage plots, and metric files, if included
- `backend/` — optional inference API
- `public/results/` — result images used by the web interface, if included

Only directories and files that actually exist in the repository should be listed as included.

## Running the Web Prototype

If the repository includes the RetinaSure website, install Node.js and npm, open a terminal in the website directory, and run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

Without a configured inference backend, the website may display labelled sample data rather than predictions from the trained model. Sample outputs must not be presented as live model inference.

### Optional inference backend

If the backend source and its Python dependencies are included:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8000
```

The API health endpoint is expected at `http://localhost:8000/health`, according to the prototype setup instructions.

Configure `VITE_API_URL=http://localhost:8000` in the website's `.env` file and restart the development server. Check the backend implementation and configuration before assuming that model inference is operational.

The trained checkpoint and other large artifacts may need to be obtained separately. Do not commit credentials, private configuration files, or datasets.

## Limitations

- Evaluation is based on a validation split, not an independent external test set.
- Exploratory calibration results do not establish reliable confidence estimates under clinical distribution shifts.
- Temperature scaling did not improve the reported exploratory calibration metrics.
- Prototype-bank or graph refinement has not been shown to improve model performance.
- Grad-CAM visualizations are explanatory aids, not proof that the model uses clinically valid reasoning.
- The prototype has not been validated for clinical diagnosis and must not replace professional medical assessment.

## Future Work

Potential next steps include:

- Independent external-dataset evaluation.
- More comprehensive calibration and uncertainty analysis.
- Quantitative evaluation of explanation quality.
- Experimental validation of proposed graph-refinement methods.
- Robustness assessment across image quality and dataset shifts.

These are research directions, not completed results unless supported by new experiments.

## Disclaimer

RetinaSure is intended for educational and research purposes only. It is not a medical device, has not been validated for clinical use, and must not be used to diagnose diabetic retinopathy or make treatment decisions.

## Author

**Divyanshi Kumari, Vanshika Sharma**

B.Tech, Computer Science and Engineering (Data Science)

Corresponding Author: Dr. Pankaj Pandey

GitHub: [https://github.com/Divyanshi-kumari](https://github.com/Divyanshi-kumari)

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from PIL import Image
import pytesseract
import io
import re

app = FastAPI()

# 🔥 IMPORTANT (path to tesseract)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

class Message(BaseModel):
    text: str

# ------------------------
# RULE-BASED ANALYSIS
# ------------------------
def analyze_scam(text):
    score = 0
    reasons = []
    highlights = []

    text_lower = text.lower()

    urgency_words = ["urgent", "immediately", "act now", "turant"]
    financial_words = ["bank", "otp", "password", "account", "verify", "aapka"]

    for word in urgency_words:
        if word in text_lower:
            score += 20
            reasons.append("Creates urgency pressure")
            highlights.append(word)

    for word in financial_words:
        if word in text_lower:
            score += 25
            reasons.append("Requests sensitive info")
            highlights.append(word)

    urls = re.findall(r"http[s]?://\S+", text)
    if urls:
        score += 30
        reasons.append("Contains external link")
        highlights.extend(urls)

    score = min(score, 100)

    if score > 70:
        label = "High Risk"
    elif score > 40:
        label = "Medium Risk"
    else:
        label = "Low Risk"

    return {
        "score": score,
        "label": label,
        "reasons": list(set(reasons)),
        "highlights": list(set(highlights)),
        "urls": urls
    }

# ------------------------
# TEXT INPUT API
# ------------------------
@app.post("/detect-scam")
def detect_scam(msg: Message):
    return analyze_scam(msg.text)

# ------------------------
# IMAGE OCR API
# ------------------------
@app.post("/scan-image")
async def scan_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    extracted_text = pytesseract.image_to_string(image)

    result = analyze_scam(extracted_text)

    return {
        "extracted_text": extracted_text,
        "analysis": result
    }
from fastapi import FastAPI
from pydantic import BaseModel
import re

app = FastAPI()

class Message(BaseModel):
    text: str

SUSPICIOUS_WORDS = ["urgent", "immediately", "act now", "otp", "password", "bank", "verify", "click"]

def analyze_scam(text):
    score = 0
    reasons = []
    highlights = []

    text_lower = text.lower()

    urgency_words = ["urgent", "immediately", "act now"]
    financial_words = ["bank", "otp", "password", "account", "verify"]

    # Urgency
    for word in urgency_words:
        if word in text_lower:
            score += 20
            reasons.append("Creates urgency pressure")
            highlights.append(word)

    # Financial
    for word in financial_words:
        if word in text_lower:
            score += 25
            reasons.append("Requests sensitive info")
            highlights.append(word)

    # URL detection
    urls = re.findall(r"http[s]?://\S+", text)
    if urls:
        score += 30
        reasons.append("Contains external link")
        highlights.extend(urls)

        # Fake domain check (basic)
        for url in urls:
            if any(x in url for x in ["bit.ly", "tinyurl", "free", "bonus"]):
                score += 15
                reasons.append("Suspicious shortened or bait link")

    # Too many triggers
    if len(reasons) >= 3:
        score += 10

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

@app.post("/detect-scam")
def detect_scam(msg: Message):
    return analyze_scam(msg.text)
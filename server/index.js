const multer = require("multer");
const FormData = require("form-data");
const upload = multer();

const mongoose = require("mongoose");
const Scan = require("./models/Scan");

mongoose.connect("mongodb+srv://prasannakekare_db_user:YVgQYztIaca9E3D7@ai-scam.orpkgh7.mongodb.net/")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
  
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());


app.post("/scan-image", upload.single("image"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, "image.png");

    const response = await axios.post(
      "http://localhost:8000/scan-image",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Image scan failed" });
  }
});

app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await axios.post("http://localhost:8000/detect-scam", {
      text,
    });

    const saved = await Scan.create({
      text,
      result: response.data,
    });

    res.json(saved.result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/scan-image", upload.single("image"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: "image.png",
      contentType: "image/png",
    });

    const response = await axios.post(
      "http://localhost:8000/scan-image",
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("IMAGE ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Image scan failed" });
  }
});

app.get("/history", async (req, res) => {
  const data = await Scan.find().sort({ createdAt: -1 });
  res.json(data);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
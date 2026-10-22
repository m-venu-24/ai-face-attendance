# 🎯 AI Face Recognition Attendance System

A contactless, real-time attendance system built with Python, OpenCV, and `face_recognition`.

---

## 📁 Project Structure

```
face_attendance/
│
├── 1_capture_dataset.py   ← Step 1: Collect face images via webcam
├── 2_train_model.py       ← Step 2: Encode faces & save model
├── 3_attendance.py        ← Step 3: Live recognition + attendance marking
│
├── requirements.txt       ← Python dependencies
│
├── dataset/               ← Auto-created by Step 1
│   ├── Alice/
│   │   ├── 1.jpg
│   │   └── ...
│   └── Bob/
│       └── ...
│
├── encodings.pkl          ← Auto-created by Step 2
└── attendance.csv         ← Auto-created by Step 3
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

> **Windows users:** You may need to install `cmake` and `dlib` manually first:
> ```bash
> pip install cmake dlib
> pip install face-recognition
> ```

---

## 🚀 How to Run (3 Steps)

### Step 1 — Capture face images
```bash
python 1_capture_dataset.py
```
- Enter the person's name when prompted
- Look at the webcam — 50 images are captured automatically
- Repeat for every person you want to register

### Step 2 — Train / encode faces
```bash
python 2_train_model.py
```
- Reads all images from `dataset/`
- Encodes each face and saves to `encodings.pkl`
- Run **once** after all people are registered (or re-run if you add new people)

### Step 3 — Start live attendance
```bash
python 3_attendance.py
```
- Opens the webcam
- Detects and recognizes faces in real time
- Marks attendance in `attendance.csv` (once per person per session)
- Press **Q** to quit

---

## 📊 Output — attendance.csv

| Name  | Date       | Time        |
|-------|------------|-------------|
| Alice | 2026-03-29 | 10:05:32 AM |
| Bob   | 2026-03-29 | 10:06:11 AM |

---

## 🎛️ Configuration

Edit these constants in `3_attendance.py` to tune behaviour:

| Constant       | Default | Effect                                      |
|----------------|---------|---------------------------------------------|
| `TOLERANCE`    | `0.50`  | Lower = stricter match (try 0.4–0.6)        |
| `SCALE_FACTOR` | `0.5`   | Smaller = faster but lower resolution       |

---

## 🧠 How It Works

```
Webcam Frame
    │
    ▼
Resize (50%) ──► Faster processing
    │
    ▼
face_recognition.face_locations()   ← Detects face bounding boxes
    │
    ▼
face_recognition.face_encodings()   ← Extracts 128-dimension feature vector (CNN)
    │
    ▼
face_recognition.face_distance()    ← Euclidean distance vs stored encodings
    │
    ├── Distance ≤ TOLERANCE → Known person → Mark attendance
    └── Distance > TOLERANCE → Unknown
```

---

## 💡 Tips for Better Accuracy

- Capture images in **good lighting**
- Include **different angles** (slight left, right, straight)
- Avoid blurry images
- Capture **at least 30–50 images** per person

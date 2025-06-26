# E-Voting System with Fingerprint Integration

This project integrates a fingerprint sensor (R307S) with an HTML/CSS/JS-based e-voting system using Arduino and Python Flask.

---

## 🧩 System Components

- **Arduino Uno**
- **Fingerprint Sensor (R307S)**
- **PC (running Flask server and frontend)**
- **USB cable** for Arduino to PC connection
- **Wiring Jumpers**

---

## 🗂️ Folder Structure

```
Evoting_Fingerprint_Integrated/
├── frontend/
├── arduino/
│   └── fingerprint.ino
├── server/
│   └── app.py
├── README.md
```

---

## ⚙️ Hardware Connections

Connect the **R307S** fingerprint sensor to the Arduino Uno as follows:

| R307S Pin | Arduino Uno Pin |
|-----------|-----------------|
| VCC       | 5V              |
| GND       | GND             |
| TX        | Pin 2           |
| RX        | Pin 3           |

> Note: The RX/TX pins are swapped. Use **SoftwareSerial** on pins 2 and 3.

---

## 🚀 Getting Started

### 1. Install Dependencies

#### 🖥️ On the PC:
- Install Python 3
- Install Flask and pyserial:
  ```bash
  pip install flask pyserial
  ```

### 2. Upload Arduino Code
- Open `fingerprint.ino` in the Arduino IDE
- Connect the Arduino Uno via USB
- Select the correct port and upload the code

### 3. Run the Flask Server
```bash
cd server
python app.py
```
- Ensure the COM port in `app.py` matches your Arduino port (e.g., `COM3` on Windows, `/dev/ttyUSB0` on Linux)

### 4. Open Frontend
- Open `index.html`, `admin.html`, or `student.html` in your browser
- Use the buttons:
  - **Admin:** Enroll fingerprint (enters ID and sends to Arduino)
  - **Student:** Verify fingerprint (checks scanned finger and returns ID)

---

## ✅ Use Cases
- **Admin** enrolls student fingerprints from the dashboard
- **Students** verify fingerprint before voting
- Data is verified and managed through Arduino and browser communication

---

## 🛠️ Troubleshooting
- Ensure Arduino is connected and COM port is correct
- Check sensor wiring
- Run Flask before pressing any buttons on the web UI
- Use Chrome or Firefox for best frontend JS support

---

## 📌 To Do (Optional Improvements)
- Store fingerprints and student records in a database (e.g., SQLite/MySQL)
- Add login system for admin
- Add vote submission and result counting
- Use ESP32 to make system fully wireless

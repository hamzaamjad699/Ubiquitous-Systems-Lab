# ❤️ Heart Rate Detection  
## ECG + PPG Comparison using ESP32, AD8232, and Bangle.js

---

## Project Overview

Wearable devices such as **Bangle.js** typically rely on **PPG (Photoplethysmography)** to estimate heart rate. While convenient, PPG is sensitive to motion artifacts and environmental factors.

This project improves heart rate detection by integrating an **external ECG sensor (AD8232)** with **Bangle.js**, enabling:

- Real-time raw ECG acquisition using ESP32  
- Simultaneous PPG measurement from the Bangle.js internal HRM  
- Live ECG visualization on the smartwatch  
- Wireless streaming of ECG and PPG to a PC  
- Comparative analysis of ECG and PPG signals  

The system demonstrates that **ECG provides a more stable and reliable physiological signal** than PPG.

---

## System Architecture

AD8232 ECG Sensor
|
v
ESP32 (ADC + BLE Peripheral)
|
| Raw ECG via BLE Notifications
v
Bangle.js (BLE Central)

 -> Live ECG visualization
  
 ->  Internal PPG (HRM sensor)
  
 ->  UART relay (ECG + PPG)
      |
      v
 ->  PC (Python + Bleak)
  
 ->  Live ECG (AC component)
  
 ->  Live PPG (BPM)
  
 ->  Signal comparison


---

## Components Used

### Hardware
- Bangle.js v2
- ESP32 DevKit
- AD8232 ECG sensor
- ECG electrodes and leads

### Software
- Bangle.js JavaScript API
- ESP32 Arduino Framework
- Python 3
- Bleak (BLE client)
- Matplotlib (live plotting)

---

## Implementation Details

### ESP32 Firmware (`ecg_signals_sender.ino`)
- Reads raw ECG values using 12-bit ADC (0–4095)
- Sampling rate ≈ 125 Hz
- Sends ECG samples via BLE notifications
- Custom BLE service and characteristic

---

### Bangle.js Application (`heart_rate_detection.app.js`)
- Acts as BLE central device
- Connects to ESP32 and receives raw ECG
- Displays live ECG waveform on the watch
- Reads PPG heart rate using internal HRM
- Relays data to PC in the format:
ECG_RAW,PPG_BPM


Visual scaling is applied **only for display**, raw data remains unchanged.

---

### Python Desktop Application (`heart_rate_detection_live_plot.py`)
- Connects to Bangle.js using Bleak
- Subscribes to Nordic UART notifications
- Parses incoming ECG and PPG values
- Applies baseline removal to ECG
- Displays live ECG (AC component) and PPG (BPM)

---

## Signal Processing

### ECG Baseline Removal
A slow exponential moving average (EMA) is used:

baseline = (1 - α) * baseline + α * ECG_RAW
ECG_AC = ECG_RAW - baseline


- Removes DC offset and drift
- Preserves ECG waveform variations
- No additional filtering applied

---

## Project Contributors & Roles

### Hamza Amjad  
**Role: System Integration & Wearable Application Lead**

- Bangle.js app development (ECG visualization + PPG UI)
- BLE central logic (scan, connect, subscribe, retry)
- Real-time ECG rendering and UI/UX design
- End-to-end system integration (ESP32 ↔ Bangle.js ↔ PC)
- Documentation, presentation, and experimental validation
- ECG vs PPG comparative analysis

---

### Muhammad Waleed Amjad  
**Role: Desktop Visualization & Signal Processing**

- Python visualization using Matplotlib
- BLE client integration using Bleak
- Real-time buffering and plotting
- ECG baseline removal implementation
- Performance optimization and analysis support

---

### Osama Yousaf  
**Role: Embedded Hardware & Firmware**

- AD8232 ECG sensor setup and validation
- ESP32 firmware development
- BLE GATT service and characteristic design
- ADC configuration and ECG sampling logic
- Embedded system architecture support

---

## Results & Observations

- ECG signal remains stable during motion
- PPG is more sensitive to motion artifacts
- ECG provides clearer cardiac timing information
- Combined visualization enables cross-validation of heart rate

---

## Future Improvements

- ECG R-peak detection and heart rate estimation
- Motion artifact filtering
- On-device heart rate computation
- Long-term ECG and PPG data logging
- Improved wearable UI controls

---

## Academic Context

This project was developed as part of the **Ubiquitous Computing** course  
at **University of Siegen**.

It demonstrates:
- Embedded systems integration
- BLE communication
- Wearable computing
- Real-time physiological signal visualization
- Comparative biosignal analysis

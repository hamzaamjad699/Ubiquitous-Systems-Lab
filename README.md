# CardioFusion – ECG + PPG Heart Rate Comparison
A real-time ECG + PPG fusion system using **ESP32 + AD8232 ECG sensor + Bangle.js smartwatch**.

## 🔹 Team Members
- **Hamza Amjad** – Hardware setup, AD8232 integration, Bangle.js BLE receiver
- **Muhammad Waleed Amjad** – ESP32 firmware, BLE service design, ADC processing
- **Osama Yousaf** – Data visualization, UI design, ECG graph rendering, system integration

---

## 🔹 Project Description
The system collects:
- **ECG** from AD8232 via ESP32  
- **PPG-based BPM** from Bangle.js HR sensor  

The Bangle.js device:
1. Receives ECG over Bluetooth  
2. Reads internal PPG BPM  
3. Displays live ECG waveform  
4. Relays a 2-byte packet: `[ECG, BPM]`

---

## 🔹 Repository Structure

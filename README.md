# CardioFusion – Real-time ECG + PPG Heart Rate Comparison

A system combining **ECG from AD8232 + ESP32** with **PPG heart rate from Bangle.js** to compare accuracy and visualize signals in real time.

---

## Group Members
- **Hamza Amjad** – Hardware integration, Bangle.js BLE receiver, ECG visualization  
- **Muhammad Waleed Amjad** – ESP32 firmware, BLE service design, ADC processing  
- **Osama Yousaf** – Data visualization logic, UI design, documentation  

---

## System Overview
1. **AD8232** generates analog ECG waveform.  
2. **ESP32** reads signal → scales to 8-bit → transmits via BLE notifications.  
3. **Bangle.js** receives ECG data and simultaneously reads PPG BPM.  
4. Watch displays ECG waveform + BPM and relays both as a combined telemetry packet.

---

## Repository Structure

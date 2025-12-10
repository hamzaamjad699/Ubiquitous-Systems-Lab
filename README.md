# CardioFusion — Real-time ECG + PPG Heart Rate Comparison

**CardioFusion** combines an AD8232 ECG front-end + ESP32 with the Bangle.js smartwatch PPG sensor to capture, display and compare heart-rate signals in real time.

This repository contains:
- ESP32 firmware that reads an AD8232 ECG signal, scales samples to 8-bit and transmits them over BLE.
- Bangle.js app that receives ECG notifications, reads PPG BPM from the watch HRM, displays a real-time ECG waveform, and relays a 2-byte telemetry packet `[ECG, PPG]`.
- Documentation, example wiring and troubleshooting notes.

---

## Team
- **Hamza Amjad** — Hardware integration, Bangle.js BLE receiver, ECG visualization  
- **Muhammad Waleed Amjad** — ESP32 firmware, BLE service design, ADC processing  
- **Osama Yousaf** — Data visualization, UI and documentation

---

## System overview
1. AD8232 outputs analog ECG waveform (electrodes connected to patient).  
2. ESP32 samples the ECG (12-bit ADC), scales to 8-bit and sends via BLE notifications at ~25 Hz.  
3. Bangle.js connects to ESP32, receives ECG samples, and simultaneously monitors PPG BPM from the built-in HRM.  
4. The watch displays a scrolling ECG waveform and the PPG BPM number; it also broadcasts a combined BLE telemetry characteristic with two bytes: `[ECG, BPM]`.

---

## Key parameters / identifiers
- **BLE Service UUID:** `4fafc201-1fb5-459e-8fcc-c5c9c331914b`  
- **BLE Characteristic UUID:** `beb5483e-36e1-4688-b7f5-ea07361b26a8`  
- **ESP32 advertised device name:** `ESP32_ECG_Custom`  
- **Telemetry packet (watch relay):** two bytes — `Byte0 = ECG sample (0–255)`, `Byte1 = PPG BPM (integer)`  
- **Target sample rate (ESP32):** ~25 Hz (40 ms delay between packets)

---

## Hardware
- **ECG front-end:** AD8232 (LO+, LO−, SDN, OUTPUT)  
- **MCU:** ESP32 (analog input pin used in example: `GPIO35`)  
- **Power/shutdown pin used in example:** `GPIO33` (must be driven HIGH to power AD8232 in our firmware)

**Wiring notes**
- Connect AD8232 `OUT` → ESP32 ADC pin (e.g. GPIO35).  
- Drive AD8232 `SDN` pin HIGH (e.g. GPIO33) to power module (as in sample code).  
- Ensure electrode placement is stable; reduce movement and check grounding to limit baseline wander.

---

## Firmware (ESP32)
Example behavior implemented in `esp32_firmware.ino`:
- Initializes BLE server and a NOTIFY characteristic (UUIDs above).
- Reads analog ECG (`analogRead(SENSOR_PIN)`), maps 0–4095 → 0–255.
- Sends each sample in a 1-byte notify packet (`pCharacteristic->setValue(&value, 1); pCharacteristic->notify();`).
- Waits ~40 ms between sends to target ~25 Hz.

**Pins / constants used in example**
```c
#define SENSOR_PIN 35   // ADC pin connected to AD8232 output
#define SDN_PIN    33   // AD8232 SDN pin (HIGH to enable)

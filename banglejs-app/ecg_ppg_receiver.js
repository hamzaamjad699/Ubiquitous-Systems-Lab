// ===============================================
// CardioFusion – Class-Based Version
// ===============================================

const BLE_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const BLE_CHAR_UUID    = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const GRAPH_WIDTH = 240;

class HeartMonitor {
  constructor() {
    this.pos = 0;
    this.ppgBPM = 0;

    this.initPPG();
    this.initRelayService();
    this.initUI();
    setTimeout(() => this.scanAndConnect(), 1000);
  }

  // --- Initialize internal PPG sensor
  initPPG() {
    Bangle.setHRMPower(true);
    Bangle.on("HRM", hrm => this.ppgBPM = hrm.bpm || 0);
  }

  // --- Initialize BLE service to relay ECG + PPG
  initRelayService() {
    NRF.setServices({
      0x181A: {
        0x2A58: { value: [0, 0], notify: true, readable: true }
      }
    });
  }

  // --- Draw ECG graph + BPM
  drawECG(ecgValue) {
    // Relay BLE packet
    try {
      NRF.updateServices({
        0x181A: {
          0x2A58: { value: [ecgValue, this.ppgBPM], notify: true }
        }
      });
    } catch(e) {}

    // Clear previous line
    g.setColor(0,0,0);
    let nextPos = (this.pos + 3) % GRAPH_WIDTH;
    g.fillRect(this.pos, 40, nextPos, 239);

    // Plot new ECG point
    g.setColor(0,1,0);
    let y = Math.max(40, Math.min(239, 200 - ecgValue/1.5));
    g.setPixel(this.pos, y);

    // Show BPM
    g.setColor(1,1,1);
    g.setFont("6x8", 2);
    g.drawString("PPG:" + this.ppgBPM, 140, 220, true);

    // Move cursor
    this.pos = nextPos;
  }

  // --- Scan for ESP32 and connect
  scanAndConnect() {
    g.clear();
    g.setFont("Vector", 18);
    g.drawString("Scanning...", 10, 50);

    NRF.requestDevice({ filters: [{ name: "ESP32_ECG_Custom" }] })
      .then(device => device.gatt.connect())
      .then(gatt => gatt.getPrimaryService(BLE_SERVICE_UUID))
      .then(service => service.getCharacteristic(BLE_CHAR_UUID))
      .then(char => this.setupNotifications(char))
      .catch(() => this.retryScan());
  }

  // --- Set up notifications from ESP32
  setupNotifications(characteristic) {
    g.clear();
    g.setFont("6x8", 2);
    g.drawString("SYSTEM ACTIVE", 60, 10);

    characteristic.on("characteristicvaluechanged", evt => {
      let ecg = evt.target.value.getUint8(0);
      this.drawECG(ecg);
    });

    characteristic.startNotifications();
  }

  // --- Retry scanning on failure
  retryScan() {
    g.clear();
    g.drawString("Retrying...", 10, 50);
    setTimeout(() => this.scanAndConnect(), 3000);
  }

  // --- Initial UI
  initUI() {
    g.clear();
    g.drawString("Initializing...", 10, 50);
  }
}

// --- Instantiate HeartMonitor
new HeartMonitor();

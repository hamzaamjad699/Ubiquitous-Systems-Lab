// =================================================
// Heart Rate Detection
// Raw ECG (BLE) + Internal PPG (Bangle.js)
// =================================================

// ---------- ESP32 BLE UUIDs ----------
const ECG_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const ECG_CHAR_UUID    = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// ---------- Graph State ----------
let xPos = 0;
let lastY = 120;
let currentPPG = 0;

// ---------- Display Scaling (visual only) ----------
const ECG_ADC_MIDPOINT = 2048; // 12-bit ADC midpoint
const ECG_DRAW_GAIN    = 0.08; // screen scaling only

// ---------- Screen ----------
Bangle.setLCDTimeout(0);
Bangle.setLCDPower(1);

// ---------- Internal PPG ----------
Bangle.setHRMPower(1);
Bangle.on("HRM", hrm => {
  currentPPG = hrm.bpm || 0;
});

// =================================================
// Draw ECG + Relay UART
// =================================================
function drawECG(rawECG) {

  // Send RAW ECG + PPG to PC (UART)
  Bluetooth.write(rawECG + "," + currentPPG + "\n");

  const graphTop = 50;
  const graphBottom = 200;
  const graphCenter = (graphTop + graphBottom) / 2;

  // Clear ahead
  g.setColor(0,0,0);
  const clearWidth = 6;
  if (xPos + clearWidth < 240) {
    g.fillRect(xPos, graphTop, xPos + clearWidth, graphBottom);
  } else {
    g.fillRect(xPos, graphTop, 239, graphBottom);
    g.fillRect(0, graphTop, (xPos + clearWidth) - 240, graphBottom);
  }

  // Scale ECG for display only
  let y = graphCenter - ((rawECG - ECG_ADC_MIDPOINT) * ECG_DRAW_GAIN);
  y = Math.max(graphTop, Math.min(graphBottom, y));

  g.setColor(0,1,0);
  if (xPos > 0) g.drawLine(xPos - 1, lastY, xPos, y);
  else g.setPixel(xPos, y);

  lastY = y;

  // Display PPG
  g.setColor(0,0,0);
  g.fillRect(140, 210, 240, 240);
  g.setColor(1,1,1);
  g.setFont("6x8", 2);
  g.drawString("PPG: " + currentPPG, 140, 220);

  xPos++;
  if (xPos >= 240) {
    xPos = 0;
    lastY = y;
  }
}

// =================================================
// BLE Scan + Connect
// =================================================
function connectECG() {
  g.clear();
  g.setFont("Vector", 18);
  g.drawString("Scanning for\nECG Sensor...", 10, 50);

  NRF.requestDevice({ filters: [{ name: "ESP32_ECG_Custom" }] })
    .then(d => d.gatt.connect())
    .then(g => g.getPrimaryService(ECG_SERVICE_UUID))
    .then(s => s.getCharacteristic(ECG_CHAR_UUID))
    .then(c => {

      g.clear();
      g.setFont("6x8", 2);
      g.setColor(0,1,0);
      g.drawString("Heart Rate Detection", 10, 10);
      g.setColor(1,1,1);
      g.drawString("ECG + PPG Live", 40, 30);

      c.on("characteristicvaluechanged", e => {
        const lsb = e.target.value.getUint8(0);
        const msb = e.target.value.getUint8(1);
        const rawECG = lsb | (msb << 8);
        drawECG(rawECG);
      });

      return c.startNotifications();
    })
    .catch(() => {
      g.clear();
      g.drawString("Retrying...", 60, 100);
      setTimeout(connectECG, 3000);
    });
}

// =================================================
// Start App
// =================================================
g.clear();
g.drawString("Heart Rate Detection", 10, 50);
setTimeout(connectECG, 1000);

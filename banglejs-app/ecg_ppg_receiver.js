var ESP_SERVICE = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
var ESP_CHAR    = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

var pos = 0;
var localBPM = 0;

// Enable internal PPG sensor
Bangle.setHRMPower(1);
Bangle.on('HRM', hrm => {
  localBPM = hrm.bpm || 0;
});

// Service to relay ECG + BPM
NRF.setServices({
  0x181A: {
    0x2A58: {
      value : [0, 0],
      notify : true,
      readable: true
    }
  }
});

function drawGraph(ecgVal) {
  // Relay ECG + BPM
  try {
    NRF.updateServices({
      0x181A : {
        0x2A58 : { value : [ecgVal, localBPM], notify: true }
      }
    });
  } catch(e) { }

  // Erase old graph line
  g.setColor(0,0,0);
  g.fillRect(pos, 40, (pos+3)%240, 239);

  // Plot ECG point
  g.setColor(0,1,0);
  var y = 200 - (ecgVal / 1.5);
  y = Math.max(40, Math.min(239, y));
  g.setPixel(pos, y);

  // Display BPM
  g.setColor(1,1,1);
  g.setFont("6x8", 2);
  g.drawString("PPG:" + localBPM, 140, 220, true);

  pos = (pos + 1) % 240;
}

function startScan() {
  g.clear();
  g.setFont("Vector", 18);
  g.drawString("Scanning...", 10, 50);

  NRF.requestDevice({ filters: [{ name: "ESP32_ECG_Custom" }] })
    .then(device => device.gatt.connect())
    .then(gatt => gatt.getPrimaryService(ESP_SERVICE))
    .then(service => service.getCharacteristic(ESP_CHAR))
    .then(characteristic => {

      g.clear();
      g.setFont("6x8", 2);
      g.drawString("SYSTEM ACTIVE", 60, 10);

      characteristic.on('characteristicvaluechanged', event => {
        drawGraph(event.target.value.getUint8(0));
      });

      characteristic.startNotifications();
    })
    .catch(() => {
      g.clear();
      g.drawString("Retrying...", 10, 50);
      setTimeout(startScan, 3000);
    });
}

g.clear();
g.drawString("Initializing...", 10, 50);
setTimeout(startScan, 1000);

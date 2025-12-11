#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ========================================
// Configuration
// ========================================
constexpr int SENSOR_PIN = 35;
constexpr int SDN_PIN    = 33;
constexpr char* DEVICE_NAME = "ESP32_ECG_Custom";

constexpr char* SERVICE_UUID        = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
constexpr char* CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

constexpr int SAMPLE_DELAY_MS = 40;

// ========================================
// ECG BLE Server Class
// ========================================
class ECGServer {
private:
  BLEServer* server;
  BLECharacteristic* characteristic;
  bool deviceConnected;

public:
  ECGServer() : server(nullptr), characteristic(nullptr), deviceConnected(false) {}

  void begin() {
    pinMode(SENSOR_PIN, INPUT);
    pinMode(SDN_PIN, OUTPUT);
    digitalWrite(SDN_PIN, HIGH);

    Serial.begin(115200);

    BLEDevice::init(DEVICE_NAME);

    server = BLEDevice::createServer();
    server->setCallbacks(new ServerCallbacks(this));

    BLEService* service = server->createService(SERVICE_UUID);

    characteristic = service->createCharacteristic(
      CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_NOTIFY
    );
    characteristic->addDescriptor(new BLE2902());

    service->start();

    BLEAdvertising* advertising = BLEDevice::getAdvertising();
    advertising->addServiceUUID(SERVICE_UUID);
    BLEDevice::startAdvertising();

    Serial.println("ESP32 Ready! Advertising BLE...");
  }

  void update() {
    if (!deviceConnected) return;

    int rawValue = analogRead(SENSOR_PIN);
    uint8_t scaledValue = map(rawValue, 0, 4095, 0, 255);

    characteristic->setValue(&scaledValue, 1);
    characteristic->notify();

    delay(SAMPLE_DELAY_MS);
  }

  void onConnect() { deviceConnected = true; }
  void onDisconnect() {
    deviceConnected = false;
    delay(500);
    server->getAdvertising()->start();
  }

private:
  // Nested class to handle BLE callbacks
  class ServerCallbacks : public BLEServerCallbacks {
    ECGServer* parent;
  public:
    ServerCallbacks(ECGServer* p) : parent(p) {}
    void onConnect(BLEServer* pServer) override { parent->onConnect(); }
    void onDisconnect(BLEServer* pServer) override { parent->onDisconnect(); }
  };
};

// ========================================
// Instantiate ECGServer
// ========================================
ECGServer ecg;

void setup() {
  ecg.begin();
}

void loop() {
  ecg.update();
}

#include <Wire.h>
#include <SPI.h>
#include <RF24.h>
#include <DHT.h>
#include <TinyGPSPlus.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// --- Pin Definitions ---
#define DHTPIN 15
#define DHTTYPE DHT11
#define NRF_CE_PIN 4
#define NRF_CSN_PIN 5
#define GPS_RX_PIN 16 // Connect to TX on GPS module
#define GPS_TX_PIN 17 // Connect to RX on GPS module

// --- Object Instantiations ---
DHT dht(DHTPIN, DHTTYPE);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // Use UART2 for GPS
Adafruit_MPU6050 mpu;
RF24 radio(NRF_CE_PIN, NRF_CSN_PIN);

const byte address[6] = "00001"; // NRF communication address

// --- Data Structures (Max 32 bytes for NRF24) ---
struct __attribute__((packed)) IMUData {
  char type = 'I';
  float pitch;
  float roll;
  float yaw;
};

struct __attribute__((packed)) EnvData {
  char type = 'E';
  float temp;
  float hum;
  float lat;
  float lon;
};

// --- Timers ---
unsigned long lastImuTime = 0;
const unsigned long imuInterval = 2500; // 2.5 seconds

unsigned long lastEnvTime = 0;
const unsigned long envInterval = 10000; // 10 seconds

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  
  // Initialize DHT
  dht.begin();
  
  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }

  // Initialize NRF24L01
  if (!radio.begin()) {
    Serial.println("NRF24 hardware is not responding!!");
  } else {
    radio.openWritingPipe(address);
    radio.setPALevel(RF24_PA_MAX); // Set to max power
    radio.setDataRate(RF24_1MBPS);
    radio.stopListening(); // Set as transmitter
  }
  
  Serial.println("CubeSat Initialized.");
}

void loop() {
  unsigned long currentMillis = millis();

  // Parse GPS data constantly
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Send IMU Data every 2.5 seconds
  if (currentMillis - lastImuTime >= imuInterval) {
    lastImuTime = currentMillis;
    
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    
    IMUData imuPayload;
    // Simple complementary filter approximation or raw accel for pitch/roll
    // Here we use raw accel converted to degrees for simplicity
    imuPayload.pitch = atan2(a.acceleration.y, a.acceleration.z) * 180 / PI;
    imuPayload.roll = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180 / PI;
    imuPayload.yaw = g.gyro.z; // Integrating gyro for true yaw requires more complex logic, passing rate for now

    radio.write(&imuPayload, sizeof(IMUData));
    Serial.println("IMU Data Sent");
  }

  // Send Environment & GPS Data every 10 seconds
  if (currentMillis - lastEnvTime >= envInterval) {
    lastEnvTime = currentMillis;
    
    EnvData envPayload;
    envPayload.temp = dht.readTemperature();
    envPayload.hum = dht.readHumidity();
    
    if (gps.location.isValid()) {
      envPayload.lat = gps.location.lat();
      envPayload.lon = gps.location.lng();
    } else {
      envPayload.lat = 0.0;
      envPayload.lon = 0.0;
    }

    // Check for DHT read failure
    if (isnan(envPayload.temp) || isnan(envPayload.hum)) {
      envPayload.temp = -999.0;
      envPayload.hum = -999.0;
    }

    radio.write(&envPayload, sizeof(EnvData));
    Serial.println("Env & GPS Data Sent");
  }
}

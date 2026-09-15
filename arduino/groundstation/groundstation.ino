#include <Wire.h>
#include <SPI.h>
#include <RF24.h>
#include <LiquidCrystal_I2C.h>

// --- Pin Definitions ---
#define NRF_CE_PIN 4
#define NRF_CSN_PIN 5

// --- Object Instantiations ---
RF24 radio(NRF_CE_PIN, NRF_CSN_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2); // Set the LCD address to 0x27 for a 16 chars and 2 line display

const byte address[6] = "00001"; // NRF communication address

// --- Data Structures (Must match CubeSat) ---
struct __attribute__((packed)) IMUData {
  char type; // Will be 'I'
  float pitch;
  float roll;
  float yaw;
};

struct __attribute__((packed)) EnvData {
  char type; // Will be 'E'
  float temp;
  float hum;
  float lat;
  float lon;
};

// Variables for LCD updating
float lastTemp = 0.0;
float lastHum = 0.0;
unsigned long lastLcdUpdate = 0;
const unsigned long lcdInterval = 10000; // Update LCD every 10 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("AESS Ground Stn");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  delay(2000);
  lcd.clear();

  // Initialize NRF24L01
  if (!radio.begin()) {
    Serial.println("{\"error\": \"NRF24 hardware not responding\"}");
    lcd.print("NRF24 Error!");
    while (1) {} // Halt if NRF fails
  } else {
    radio.openReadingPipe(0, address);
    radio.setPALevel(RF24_PA_MAX);
    radio.setDataRate(RF24_1MBPS);
    radio.startListening(); // Set as receiver
    lcd.print("Listening...");
  }
}

void loop() {
  if (radio.available()) {
    char dataType;
    // Read just the first byte to determine the type
    radio.read(&dataType, 1);
    
    if (dataType == 'I') {
      IMUData imuData;
      imuData.type = dataType;
      // Read the rest of the struct (size - 1)
      radio.read(((uint8_t*)&imuData) + 1, sizeof(IMUData) - 1);
      
      // Output as JSON to Serial for the Web Dashboard
      Serial.print("{\"type\":\"imu\",\"pitch\":");
      Serial.print(imuData.pitch);
      Serial.print(",\"roll\":");
      Serial.print(imuData.roll);
      Serial.print(",\"yaw\":");
      Serial.print(imuData.yaw);
      Serial.println("}");

    } else if (dataType == 'E') {
      EnvData envData;
      envData.type = dataType;
      // Read the rest of the struct (size - 1)
      radio.read(((uint8_t*)&envData) + 1, sizeof(EnvData) - 1);
      
      // Output as JSON to Serial for the Web Dashboard
      Serial.print("{\"type\":\"env\",\"temp\":");
      Serial.print(envData.temp);
      Serial.print(",\"hum\":");
      Serial.print(envData.hum);
      Serial.print(",\"lat\":");
      Serial.print(envData.lat, 6);
      Serial.print(",\"lon\":");
      Serial.print(envData.lon, 6);
      Serial.println("}");
      
      // Cache data for LCD
      lastTemp = envData.temp;
      lastHum = envData.hum;
    }
  }

  // Update LCD every 10 seconds
  unsigned long currentMillis = millis();
  if (currentMillis - lastLcdUpdate >= lcdInterval) {
    lastLcdUpdate = currentMillis;
    
    lcd.clear();
    if (lastTemp == -999.0) {
      lcd.setCursor(0, 0);
      lcd.print("DHT11 Error");
    } else {
      lcd.setCursor(0, 0);
      lcd.print("Temp: ");
      lcd.print(lastTemp, 1);
      lcd.print(" C");
      
      lcd.setCursor(0, 1);
      lcd.print("Hum:  ");
      lcd.print(lastHum, 1);
      lcd.print(" %");
    }
  }
}

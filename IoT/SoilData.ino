#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>

// Provide the token generation process info
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// WiFi credentials
#define WIFI_SSID ""
#define WIFI_PASSWORD ""

// Firebase project API Key and RTDB URL
#define API_KEY ""
#define DATABASE_URL ""

// Device ID (10 characters exactly)
#define DEVICE_ID "f61hk927bv" // Change this for each device

// Sensor pins
#define DHTPIN D4     // DHT22 data pin
#define SOIL_MOISTURE_PIN A0  // Soil sensor analog pin

// Sensor types
#define DHTTYPE DHT22

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Define Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Timing variables
unsigned long sendDataPrevMillis = 0;
unsigned long sensorReadPrevMillis = 0;
const long interval = 10000;  // 10 second interval

// Sensor values
float temperature = 0;
float humidity = 0;
int soilMoisture = 0;
String status = "";

void setup() {
  Serial.begin(115200);
  
  // Initialize sensors
  dht.begin();
  pinMode(SOIL_MOISTURE_PIN, INPUT);

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  // Firebase configuration
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Anonymous sign-in
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase auth success");
    config.token_status_callback = tokenStatusCallback;
  } else {
    Serial.println("Firebase auth failed");
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  unsigned long currentMillis = millis();

  // Read sensors every 2 seconds
  if (currentMillis - sensorReadPrevMillis >= 2000) {
    sensorReadPrevMillis = currentMillis;
    readSensors();
  }

  // Send to Firebase every 10 seconds
  if (currentMillis - sendDataPrevMillis >= interval) {
    sendDataPrevMillis = currentMillis;
    sendToFirebase();
  }
}

void readSensors() {
  // Read DHT22
  float newTemp = dht.readTemperature();
  float newHumidity = dht.readHumidity();
  
  // Only update if readings are valid
  if (!isnan(newTemp)) temperature = newTemp;
  if (!isnan(newHumidity)) humidity = newHumidity;

  // Read soil moisture (average 3 readings)
  soilMoisture = 0;
  for (int i = 0; i < 3; i++) {
    soilMoisture += analogRead(SOIL_MOISTURE_PIN);
    delay(100);
  }
  soilMoisture /= 3;

  // Determine status
  if (soilMoisture < 400) status = "dry";
  else if (soilMoisture > 600) status = "wet";
  else status = "optimal";

  Serial.printf("Temp: %.1f°C | Hum: %.1f%% | Soil: %d | Status: %s\n",
                temperature, humidity, soilMoisture, status.c_str());
}

void sendToFirebase() {
  if (Firebase.ready()) {
    String path = "sensor_data/" + String(DEVICE_ID);
    
    FirebaseJson json;
    json.set("temperature", temperature);
    json.set("humidity", humidity);
    json.set("soil_moisture", soilMoisture);
    json.set("status", status);
    json.set("timestamp", millis() / 1000);
    
    // Get current time
    time_t now = time(nullptr);
    char timeStr[20];
    strftime(timeStr, sizeof(timeStr), "%H:%M:%S", localtime(&now));
    json.set("local_time", timeStr);
    
    char dateStr[20];
    strftime(dateStr, sizeof(dateStr), "%Y-%m-%d", localtime(&now));
    json.set("local_date", dateStr);

    Serial.println("Sending to Firebase...");
    
    if (Firebase.RTDB.setJSON(&fbdo, path, &json)) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error: " + fbdo.errorReason());
    }
  }
}
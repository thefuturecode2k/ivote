#include <Adafruit_Fingerprint.h>
#include <SoftwareSerial.h>

SoftwareSerial mySerial(2, 3); // RX, TX
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

void setup() {
  Serial.begin(9600);
  finger.begin(57600);
  if (finger.verifyPassword()) {
    Serial.println("Sensor ready");
  } else {
    Serial.println("Sensor error");
    while (1);
  }
}

void loop() {
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();

    if (input.startsWith("enroll:")) {
      int id = input.substring(7).toInt();
      enrollFingerprint(id);
    } else if (input == "verify") {
      int result = getFingerprintID();
      Serial.println(result);
    }
  }
}

void enrollFingerprint(int id) {
  int p = -1;
  Serial.println("Place finger...");
  while (p != FINGERPRINT_OK) p = finger.getImage();

  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) { Serial.println("Enroll fail stage 1"); return; }

  Serial.println("Remove finger");
  delay(2000);
  while (finger.getImage() != FINGERPRINT_NOFINGER);

  Serial.println("Place same finger again...");
  while (p != FINGERPRINT_OK) p = finger.getImage();

  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) { Serial.println("Enroll fail stage 2"); return; }

  p = finger.createModel();
  if (p != FINGERPRINT_OK) { Serial.println("Model creation failed"); return; }

  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Enrollment successful");
  } else {
    Serial.println("Enrollment failed");
  }
}

int getFingerprintID() {
  if (finger.getImage() != FINGERPRINT_OK) return -1;
  if (finger.image2Tz() != FINGERPRINT_OK) return -1;
  if (finger.fingerSearch() != FINGERPRINT_OK) return -1;
  return finger.fingerID;
}

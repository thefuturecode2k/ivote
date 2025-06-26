from flask import Flask, request, jsonify
import serial
import time

app = Flask(__name__)

# Adjust COM port and baud rate to match your Arduino setup
arduino = serial.Serial('/dev/ttyUSB0', 9600, timeout=2)

def send_command(cmd):
    arduino.write((cmd + '\n').encode())
    time.sleep(1)
    response = arduino.readline().decode().strip()
    return response

@app.route('/enroll', methods=['POST'])
def enroll():
    student_id = request.json.get('student_id')
    if not student_id:
        return jsonify({'status': 'error', 'message': 'Missing student_id'}), 400
    response = send_command(f'enroll:{student_id}')
    return jsonify({'status': 'ok', 'message': response})

@app.route('/verify', methods=['GET'])
def verify():
    response = send_command('verify')
    return jsonify({'status': 'ok', 'student_id': response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

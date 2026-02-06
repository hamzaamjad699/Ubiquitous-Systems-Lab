import asyncio
import threading
from collections import deque
from bleak import BleakScanner, BleakClient

import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# ---------------- BLE CONFIG ----------------
UART_TX_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

# ---------------- BUFFERS ----------------
ECG_WINDOW = 500
PPG_WINDOW = 100

ecg_buffer = deque(maxlen=ECG_WINDOW)
ppg_buffer = deque(maxlen=PPG_WINDOW)

baseline = None
BASELINE_ALPHA = 0.001

# ---------------- BLE TASK ----------------
async def ble_task():
    global baseline

    print("Scanning for Bangle.js...")

    device = await BleakScanner.find_device_by_filter(
        lambda d, ad: d.name and "Bangle" in d.name
    )

    if not device:
        print("Bangle.js not found.")
        return

    print(f"Found {device.name}. Connecting...")

    async with BleakClient(device) as client:
        print("Connected.")

        buffer = ""

        def handler(sender, data):
            nonlocal buffer
            global baseline

            try:
                buffer += data.decode()

                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    ecg_raw, ppg = map(int, line.split(","))

                    if baseline is None:
                        baseline = ecg_raw

                    baseline = (1 - BASELINE_ALPHA) * baseline + BASELINE_ALPHA * ecg_raw
                    ecg_ac = ecg_raw - baseline

                    ecg_buffer.append(ecg_ac)
                    ppg_buffer.append(ppg)

            except Exception:
                pass

        await client.start_notify(UART_TX_CHAR_UUID, handler)

        while True:
            await asyncio.sleep(1)

def start_ble():
    asyncio.run(ble_task())

# ---------------- PLOTTING ----------------
def start_plot():
    fig, ax = plt.subplots()

    ecg_line, = ax.plot([], [], lw=1, label="ECG (normalized)")
    ppg_line, = ax.plot([], [], lw=2, label="PPG (normalized)", color="orange")

    ax.set_title("Live ECG + PPG (Normalized)")
    ax.set_xlabel("Samples")
    ax.set_ylabel("Normalized Amplitude")
    ax.set_ylim(-1.2, 1.2)
    ax.legend(loc="upper right")

    def normalize(signal):
        if len(signal) < 5:
            return signal
        mn = min(signal)
        mx = max(signal)
        if mx - mn == 0:
            return [0 for _ in signal]
        return [(v - mn) / (mx - mn) * 2 - 1 for v in signal]

    def update(frame):
        if len(ecg_buffer) > 10:
            ecg = list(ecg_buffer)
            ecg = normalize(ecg)

            ecg_line.set_data(range(len(ecg)), ecg)
            ax.set_xlim(0, len(ecg))

        if len(ppg_buffer) > 2:
            ppg = list(ppg_buffer)
            ppg = normalize(ppg)

            ppg_line.set_data(range(len(ppg)), ppg)

        return ecg_line, ppg_line

    ani = FuncAnimation(fig, update, interval=50, blit=False)
    plt.tight_layout()
    plt.show()
# ---------------- MAIN ----------------
if __name__ == "__main__":
    ble_thread = threading.Thread(target=start_ble, daemon=True)
    ble_thread.start()

    start_plot()

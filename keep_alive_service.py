import threading
import time
import requests
from typing import Optional


class KeepAliveService:
    """Handles periodic keep-alive requests to prevent app from sleeping"""

    def __init__(self, url: str, interval: int = 840):  # 14 minutes
        self.url = url
        self.interval = interval
        self.thread: Optional[threading.Thread] = None
        self.running = False

    def ping(self) -> bool:
        """Send a keep-alive request"""
        try:
            response = requests.get(self.url, timeout=10)
            print(f"[KeepAlive] Ping sent to {self.url} - Status: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"[KeepAlive] Error pinging {self.url}: {e}")
            return False

    def _keep_alive_loop(self):
        """Main keep-alive loop"""
        print(f"[KeepAlive] Service started for {self.url} (interval: {self.interval}s)")

        while self.running:
            self.ping()
            time.sleep(self.interval)

    def start(self):
        """Start the keep-alive service"""
        if self.thread and self.thread.is_alive():
            print("[KeepAlive] Service already running")
            return

        self.running = True
        self.thread = threading.Thread(target=self._keep_alive_loop, daemon=True)
        self.thread.start()

    def stop(self):
        """Stop the keep-alive service"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        print("[KeepAlive] Service stopped")
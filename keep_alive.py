import threading
import time
import urllib.request
import os


class KeepAliveService:
    def __init__(self, url=None, interval_minutes=14):
        """
        Initialize keep-alive service for Render free tier

        Args:
            url: Your Render app URL (defaults to RENDER_URL env var)
            interval_minutes: Ping interval (default 14 minutes)
        """
        self.url = url or os.getenv('RENDER_URL', 'https://andy-tn7s.onrender.com')
        self.interval = interval_minutes * 60
        self.is_running = False
        self.thread = None

    def ping_server(self):
        """Send a keep-alive request to prevent Render from spinning down"""
        try:
            response = urllib.request.urlopen(self.url, timeout=10)
            print(f"[Keep-Alive] ✅ Ping successful at {time.strftime('%Y-%m-%d %H:%M:%S')} - Status: {response.status}")
            return True
        except Exception as e:
            # It's normal for the first ping after spin-down to fail
            print(f"[Keep-Alive] ⚠️ Ping attempt noted: {str(e)[:80]}...")
            return False

    def keep_alive_loop(self):
        """Background thread to ping the server periodically"""
        self.is_running = True

        # Send immediate first ping
        self.ping_server()

        # Continue pinging at interval
        while self.is_running:
            time.sleep(self.interval)
            self.ping_server()

    def start(self):
        """Start the keep-alive service in a background thread"""
        if self.is_running:
            print("[Keep-Alive] Service already running")
            return

        self.thread = threading.Thread(target=self.keep_alive_loop, daemon=True)
        self.thread.start()
        print(f"[Keep-Alive] 🚀 Service started for {self.url} (ping every {self.interval // 60} minutes)")

    def stop(self):
        """Stop the keep-alive service"""
        self.is_running = False
        print("[Keep-Alive] Service stopped")


# Optional: Direct execution support
if __name__ == "__main__":
    # Can be run directly for testing
    import sys

    if len(sys.argv) > 1:
        url = sys.argv[1]
        service = KeepAliveService(url=url)
    else:
        service = KeepAliveService()

    service.start()

    try:
        # Keep main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        service.stop()
        print("\n[Keep-Alive] Exiting...")

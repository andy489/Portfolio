import threading
import time
import requests
from typing import Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class KeepAliveService:
    """Handles periodic keep-alive requests to prevent app from sleeping on Render"""

    def __init__(self, url: str, interval: int = 720):  # Changed to 12 minutes for safety
        """
        Args:
            url: Full URL to ping (should be /keep-alive endpoint)
            interval: Time between pings in seconds (240 = 4 minutes)
        """
        self.url = url
        self.interval = interval
        self.thread: Optional[threading.Thread] = None
        self.running = False
        self.session = requests.Session()
        self.session.timeout = 30

        logger.info(f"KeepAliveService initialized for {url} with {interval}s interval")

    def ping(self) -> bool:
        """Send a keep-alive request"""
        try:
            response = self.session.get(self.url, timeout=10)
            if response.status_code == 200:
                logger.info(f"[KeepAlive] ✅ Ping successful - Status: {response.status_code}")
            else:
                logger.warning(f"[KeepAlive] ⚠️ Unexpected status: {response.status_code}")
            return response.status_code == 200
        except requests.exceptions.Timeout:
            logger.warning(f"[KeepAlive] ⚠️ Timeout pinging {self.url}")
            return False
        except requests.exceptions.ConnectionError:
            logger.warning(f"[KeepAlive] ⚠️ Connection error pinging {self.url}")
            return False
        except Exception as e:
            logger.error(f"[KeepAlive] ❌ Error pinging {self.url}: {str(e)[:100]}")
            return False

    def _keep_alive_loop(self):
        """Main keep-alive loop"""
        logger.info(f"[KeepAlive] 🚀 Service started (interval: {self.interval}s)")

        # Wait a bit for the server to fully start
        time.sleep(10)

        # Send initial ping
        self.ping()

        # Main loop
        while self.running:
            try:
                time.sleep(self.interval)
                if not self.ping():
                    logger.warning("[KeepAlive] Ping failed, waiting longer before next attempt")
                    time.sleep(60)  # Wait an extra minute on failure
            except KeyboardInterrupt:
                break
            except Exception as e:
                logger.error(f"[KeepAlive] Loop error: {e}")
                time.sleep(60)  # Wait a minute on error

    def start(self):
        """Start the keep-alive service in background thread"""
        if self.thread and self.thread.is_alive():
            logger.warning("[KeepAlive] Service already running")
            return

        self.running = True
        self.thread = threading.Thread(
            target=self._keep_alive_loop,
            daemon=True,
            name="KeepAliveThread"
        )
        self.thread.start()
        logger.info(f"[KeepAlive] Background thread started")

    def stop(self):
        """Stop the keep-alive service"""
        logger.info("[KeepAlive] Stopping service...")
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("[KeepAlive] Service stopped")

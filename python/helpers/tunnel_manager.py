from flaredantic import FlareTunnel, FlareConfig, ServeoConfig, ServeoTunnel
import threading
import os


# Singleton to manage the tunnel instance
class TunnelManager:
    _instance = None
    _lock = threading.Lock()

    @classmethod
    def get_instance(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def __init__(self):
        self.tunnel = None
        self.tunnel_url = None
        self.is_running = False
        self.provider = None

    def start_tunnel(self, port=None, provider="serveo"):
        """Start a new tunnel or return the existing one's URL"""
        # If tunnel is already running, return existing URL
        if self.is_running and self.tunnel_url:
            print(f"Tunnel already running: {self.tunnel_url}")
            return self.tunnel_url
        
        # Determine the correct port to use
        if port is None:
            # Check if we're in Docker environment
            if os.getenv('DOCKERIZED', '').lower() == 'true':
                port = 80  # Docker runs on port 80
            else:
                # For local development, tunnel to React frontend
                port = 5173  # React dev server
        
        # Stop any existing tunnel before starting a new one
        if self.tunnel and not self.is_running:
            try:
                self.tunnel.stop()
            except:
                pass
            self.tunnel = None
            self.tunnel_url = None

        self.provider = provider

        try:
            # Start tunnel in a separate thread to avoid blocking
            def run_tunnel():
                try:
                    if self.provider == "cloudflared":
                        config = FlareConfig(port=port, verbose=True)
                        self.tunnel = FlareTunnel(config)
                    else:  # Default to serveo
                        config = ServeoConfig(port=port) # type: ignore
                        self.tunnel = ServeoTunnel(config)

                    print(f"Starting {self.provider} tunnel on port {port}...")
                    self.tunnel.start()
                    self.tunnel_url = self.tunnel.tunnel_url
                    self.is_running = True
                    print(f"Tunnel started successfully: {self.tunnel_url}")
                except Exception as e:
                    print(f"Error in tunnel thread: {str(e)}")
                    self.is_running = False

            tunnel_thread = threading.Thread(target=run_tunnel)
            tunnel_thread.daemon = True
            tunnel_thread.start()

            # Wait for tunnel to start (max 30 seconds with better error handling)
            max_wait_time = 30  # seconds
            check_interval = 0.2  # seconds
            max_iterations = int(max_wait_time / check_interval)
            
            for i in range(max_iterations):
                if self.tunnel_url:
                    break
                import time
                time.sleep(check_interval)
                
                # Add progress indicator for long waits
                if i % 50 == 0 and i > 0:  # Every 10 seconds
                    print(f"Tunnel starting... ({i * check_interval:.1f}s elapsed)")

            if not self.tunnel_url:
                print(f"Tunnel failed to start within {max_wait_time} seconds")
                self.is_running = False

            return self.tunnel_url
        except Exception as e:
            print(f"Error starting tunnel: {str(e)}")
            self.is_running = False
            return None

    def stop_tunnel(self):
        """Stop the running tunnel"""
        if self.tunnel and self.is_running:
            try:
                self.tunnel.stop()
                self.is_running = False
                self.tunnel_url = None
                self.provider = None
                return True
            except Exception:
                return False
        return False

    def get_tunnel_url(self):
        """Get the current tunnel URL if available"""
        return self.tunnel_url if self.is_running else None

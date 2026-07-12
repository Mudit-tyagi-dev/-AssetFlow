import os
import sys
from pyngrok import ngrok
from dotenv import load_dotenv

# Load env variables from .env
load_dotenv()

def start_tunnel():
    # Set authtoken if provided in env
    auth_token = os.getenv("NGROK_AUTHTOKEN")
    if auth_token:
        ngrok.set_auth_token(auth_token)
    else:
        print("WARNING: NGROK_AUTHTOKEN not found in .env. Tunnels may be limited or require an account.")
        print("You can get an authtoken from https://dashboard.ngrok.com and add NGROK_AUTHTOKEN=your_token to your .env file.\n")
    
    # Port to expose (FastAPI default is 8000)
    port = int(os.getenv("PORT", 8000))
    
    try:
        # Open a HTTP tunnel
        print(f"Starting Ngrok tunnel to port {port}...")
        tunnel = ngrok.connect(port)
        public_url = tunnel.public_url
        
        print("\n" + "="*60)
        print("  Ngrok Tunnel Active!")
        print(f"  Public API URL: {public_url}")
        print(f"  Swagger Docs:   {public_url}/docs")
        print("="*60 + "\n")
        print("Press Ctrl+C to terminate the tunnel.\n")
        
        # Block until process is interrupted
        ngrok_process = ngrok.get_ngrok_process()
        ngrok_process.proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down ngrok tunnel...")
        ngrok.kill()
    except Exception as e:
        print(f"\nFailed to start ngrok tunnel: {e}", file=sys.stderr)

if __name__ == "__main__":
    start_tunnel()

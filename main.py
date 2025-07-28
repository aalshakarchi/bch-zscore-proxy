import os
from app import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    print(f"Listening on {port}", flush=True)
    app.run(host="0.0.0.0", port=port)

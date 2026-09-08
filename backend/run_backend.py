"""
Startup script for FastAPI backend.
"""

import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure current directory is in python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)

    print("=" * 60)
    print("Starting AI Stone Quality Inspection Backend...")
    print("API will be accessible at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60)

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

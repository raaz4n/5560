"""
Entry point that starts the FastAPI server with the recommendation router included.

This imports the original app from main.py and mounts the recommendations
router on top of it — no modifications to existing files required.
"""

from main import app
from recommendations_router import router as recommendations_router

# Register the recommendations router on the existing app
app.include_router(recommendations_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
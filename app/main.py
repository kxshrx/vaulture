from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.api import auth, creator, buyer, purchase, download
from app.db.base import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Creators Platform API",
    description="Digital Content Platform with Secure File Delivery",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for local development
uploads_path = Path("uploads")
uploads_path.mkdir(exist_ok=True)
app.mount("/files", StaticFiles(directory="uploads"), name="files")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(creator.router, prefix="/creator", tags=["Creator"])
app.include_router(buyer.router, prefix="", tags=["Buyer"])
app.include_router(purchase.router, prefix="/purchase", tags=["Purchase"])
app.include_router(download.router, prefix="/download", tags=["Download"])

@app.get("/")
def read_root():
    return {"message": "Creators Platform API - Digital Content Platform with Secure File Delivery"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

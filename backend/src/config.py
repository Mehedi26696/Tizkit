 
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""
    
    # Database - Supabase Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY: Optional[str] = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))



    # Application
    APP_NAME: str = "TrustWallet MVP Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # CORS
    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
 
    # Email (for future notifications)
    SMTP_SERVER: Optional[str] = os.getenv("SMTP_SERVER")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")



    # External APIs
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    GEMINI_BASE_URL: str = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent")
    OCR_SPACE_API_KEY: Optional[str] = os.getenv("OCR_SPACE_API_KEY")
    OCR_SPACE_BASE_URL: str = os.getenv("OCR_SPACE_BASE_URL", "https://api.ocr.space/parse/image")
    
    # Groq API (fallback for Gemini)
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
    GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1/chat/completions")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


    # LaTeX Configuration
    TECTONIC_PATH: str = os.getenv("TECTONIC_PATH", "../tectonic")
    POPPLER_PATH: str = os.getenv("POPPLER_PATH", "../poppler-23.01.0")
    LATEX_TIMEOUT: int = int(os.getenv("LATEX_TIMEOUT", "60"))

    # File Uploads
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", 10485760))  # Default to 10 MB
    
   
    @property
    def is_supabase_configured(self) -> bool:
        """Check if Supabase is properly configured."""
        return bool(self.SUPABASE_URL and self.SUPABASE_ANON_KEY)

    def is_gemini_configured(self) -> bool:
        """Return True when Gemini API settings are present."""
        return bool(self.GEMINI_API_KEY and self.GEMINI_BASE_URL)

    def is_ocr_configured(self) -> bool:
        """Return True when OCR.space API key and base URL are configured."""
        return bool(self.OCR_SPACE_API_KEY and self.OCR_SPACE_BASE_URL)

    def is_groq_configured(self) -> bool:
        """Return True when Groq API key is configured."""
        return bool(self.GROQ_API_KEY)

    def get_tectonic_paths(self) -> list[str]:
        """Return candidate paths for the tectonic executable.

        Uses configured `TECTONIC_PATH` if present, otherwise yields common
        executable names/locations so callers can probe which one exists.
        """
        candidates = []
        base_dir = Path(__file__).resolve().parents[1]
        if getattr(self, "TECTONIC_PATH", None):
            candidates.append(self.TECTONIC_PATH)
            try:
                configured_path = Path(self.TECTONIC_PATH)
                if not configured_path.is_absolute():
                    candidates.append(str(base_dir / configured_path))
            except Exception:
                pass
        # Common names to try (will work if on PATH)
        candidates.extend(["tectonic", "tectonic.exe"])
        # Common Windows portable location inside repo
        candidates.append(os.path.join(os.getcwd(), "tectonic", "tectonic.exe"))
        candidates.append(str(base_dir / "tectonic" / "tectonic.exe"))
        return candidates

    def get_poppler_paths(self) -> list[str]:
        """Return candidate directories that contain poppler binaries (pdftoppm, etc.).

        The `pdf2image` library expects a directory containing `pdftoppm`. Use
        configured `POPPLER_PATH` if set, plus some common locations.
        """
        candidates = []
        base_dir = Path(__file__).resolve().parents[1]
        if getattr(self, "POPPLER_PATH", None):
            candidates.append(self.POPPLER_PATH)
            try:
                configured_path = Path(self.POPPLER_PATH)
                if not configured_path.is_absolute():
                    candidates.append(str(base_dir / configured_path))
            except Exception:
                pass
        # Common locations on Windows and in this project
        candidates.append(os.path.join(os.getcwd(), "poppler-23.01.0", "Library", "bin"))
        candidates.append(str(base_dir / "poppler-23.01.0" / "Library" / "bin"))
        candidates.append(r"C:\Program Files\poppler-0.68.0\bin")
        candidates.append(r"C:\poppler\bin")
        return candidates
    
# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Backward-compatible accessor used by older modules.

    Some modules import `get_settings` from `src.config`. Keep this helper
    so those imports continue to work while the project migrates to the
    `settings` instance pattern.
    """
    return settings
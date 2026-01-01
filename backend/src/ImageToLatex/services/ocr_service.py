import httpx
import logging
from typing import Dict, Any
from src.config import get_settings

# Get settings instance
settings = get_settings()

logger = logging.getLogger(__name__)


class OCRService:
    """Service for OCR text extraction"""
    
    def __init__(self):
        self.api_key = settings.OCR_SPACE_API_KEY or ""
        self.base_url = settings.OCR_SPACE_BASE_URL
        self.timeout = 20.0  # Increased timeout for large images
        self.max_retries = 0  # Number of retry attempts (total 3 attempts)
    
    async def extract_text(self, image_content: bytes, filename: str, content_type: str) -> Dict[str, Any]:
        """Extract text from image using OCR.space API with retry logic"""
        
        for attempt in range(self.max_retries + 1):
            try:
                logger.info(f"OCRService: Starting OCR extraction for {filename} (attempt {attempt + 1}/{self.max_retries + 1})")
                
                if not settings.is_ocr_configured():
                    logger.warning("OCRService: OCR.space API not configured")
                    return {
                        "success": False,
                        "error": "OCR.space API key not configured or service disabled",
                        "text": None
                    }
                
                logger.info(f"OCRService: Image size: {len(image_content)} bytes, content_type: {content_type}")
                
                files = {"file": (filename, image_content, content_type)}
                data = {
                    "apikey": self.api_key,
                    "language": "eng",
                    "isOverlayRequired": False,
                    "scale": "true",  # Auto-scale for better results
                    "OCREngine": "2"  # Use OCR Engine 2 (better for complex images)
                }
                
                logger.info(f"OCRService: Sending request to {self.base_url} (timeout: {self.timeout}s)")
                
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(self.base_url, data=data, files=files)
                    
                    logger.info(f"OCRService: Received response with status {response.status_code}")
                    
                    if response.status_code == 403:
                        logger.error("OCRService: API key invalid or quota exceeded")
                        return {
                            "success": False,
                            "error": "OCR.space API key is invalid or quota exceeded",
                            "text": None
                        }
                    elif response.status_code != 200:
                        logger.error(f"OCRService: API returned non-200 status: {response.status_code}")
                        return {
                            "success": False,
                            "error": f"OCR.space API returned status {response.status_code}",
                            "text": None
                        }
                    
                    try:
                        result = response.json()
                        logger.info(f"OCRService: Successfully parsed JSON response")
                    except Exception as e:
                        logger.error(f"OCRService: Failed to parse JSON: {str(e)}")
                        return {
                            "success": False,
                            "error": f"Failed to parse OCR.space response as JSON: {str(e)}",
                            "text": None
                        }
                
                # Check if OCR processing was successful
                if result.get("IsErroredOnProcessing"):
                    error_msg = result.get("ErrorMessage", "OCR failed")
                    logger.error(f"OCRService: OCR processing error: {error_msg}")
                    return {
                        "success": False,
                        "error": f"OCR processing failed: {error_msg}",
                        "text": None
                    }
                
                parsed_results = result.get("ParsedResults", [])
                if not parsed_results:
                    logger.warning("OCRService: No parsed results in response")
                    return {
                        "success": False,
                        "error": "No text found in the image",
                        "text": None
                    }
                    
                text = parsed_results[0].get("ParsedText", "").strip()
                
                if not text:
                    logger.warning("OCRService: Parsed text is empty")
                    return {
                        "success": False,
                        "error": "No text found in the image",
                        "text": None
                    }
                
                logger.info(f"OCRService: Successfully extracted text ({len(text)} characters)")
                return {
                    "success": True,
                    "error": None,
                    "text": text
                }
                
            except httpx.TimeoutException as e:
                is_last_attempt = attempt == self.max_retries
                if is_last_attempt:
                    logger.error(f"OCR timeout error after {self.max_retries + 1} attempts: {str(e)}", exc_info=True)
                    return {
                        "success": False,
                        "error": f"OCR request timed out after {self.timeout}s (tried {self.max_retries + 1} times). The image may be too large or complex.",
                        "text": None
                    }
                else:
                    logger.warning(f"OCRService: Attempt {attempt + 1} timed out, retrying...")
                    continue
                    
            except httpx.RequestError as e:
                is_last_attempt = attempt == self.max_retries
                if is_last_attempt:
                    logger.error(f"OCR request error after {self.max_retries + 1} attempts: {str(e)}", exc_info=True)
                    return {
                        "success": False,
                        "error": f"OCR request failed: {str(e)}",
                        "text": None
                    }
                else:
                    logger.warning(f"OCRService: Attempt {attempt + 1} failed with request error, retrying...")
                    continue
                    
            except Exception as e:
                logger.error(f"OCR unexpected error: {type(e).__name__}: {str(e)}", exc_info=True)
                return {
                    "success": False,
                    "error": f"Internal server error: {type(e).__name__}: {str(e)}",
                    "text": None
                }
        
        # This should never be reached due to returns in the loop, but just in case
        return {
            "success": False,
            "error": "OCR extraction failed after all retry attempts",
            "text": None
        }

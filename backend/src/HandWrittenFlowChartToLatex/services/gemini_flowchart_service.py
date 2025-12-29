import httpx
import logging
import base64
from typing import Dict, Any, List
from src.config import get_settings
from src.ImageToLatex.services.ocr_service import OCRService

settings = get_settings()
logger = logging.getLogger(__name__)

class GeminiFlowchartService:
    """Service for analyzing handwritten flowcharts using OCR + LLM (Gemini/Groq)"""
    
    def __init__(self):
        # Gemini configuration
        self.gemini_api_key = settings.GEMINI_API_KEY or ""
        self.gemini_base_url = settings.GEMINI_BASE_URL
        
        # Groq configuration (fallback)
        self.groq_api_key = settings.GROQ_API_KEY or ""
        self.groq_base_url = settings.GROQ_BASE_URL
        self.groq_model = settings.GROQ_MODEL
        
        # OCR service for text extraction
        self.ocr_service = OCRService()
    
    async def analyze_handwritten_flowchart(self, image_bytes: bytes, filename: str = "flowchart.png") -> Dict[str, Any]:
        """
        Analyze handwritten flowchart image using OCR + LLM (Gemini with Groq fallback).
        First extracts text via OCR, then uses LLM to understand structure.
        """
        try:
            # Step 1: Extract text from image using OCR
            logger.info("FlowchartService: Step 1 - Extracting text via OCR")
            
            # Detect content type
            content_type = "image/png"
            if image_bytes[:3] == b'\xff\xd8\xff':
                content_type = "image/jpeg"
            elif image_bytes[:4] == b'\x89PNG':
                content_type = "image/png"
            elif image_bytes[:6] in (b'GIF87a', b'GIF89a'):
                content_type = "image/gif"
            elif image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
                content_type = "image/webp"
            
            ocr_result = await self.ocr_service.extract_text(image_bytes, filename, content_type)
            
            if not ocr_result.get("success") or not ocr_result.get("text"):
                logger.warning("FlowchartService: OCR extraction failed, falling back to vision API")
                # Fallback to vision API if OCR fails
                return await self._analyze_with_vision(image_bytes, filename)
            
            ocr_text = ocr_result.get("text", "")
            logger.info(f"FlowchartService: OCR extracted {len(ocr_text)} characters")
            
            # Step 2: Try Gemini first, then Groq as fallback
            logger.info("FlowchartService: Step 2 - Analyzing structure with LLM")
            
            # Try Gemini first
            if settings.is_gemini_configured():
                logger.info("FlowchartService: Trying Gemini API...")
                gemini_result = await self._analyze_with_gemini_text(ocr_text)
                if gemini_result.get("success"):
                    gemini_result["data"]["ocr_text"] = ocr_text
                    return gemini_result
                else:
                    logger.warning(f"FlowchartService: Gemini failed: {gemini_result.get('error')}")
            
            # Fallback to Groq
            if settings.is_groq_configured():
                logger.info("FlowchartService: Falling back to Groq API...")
                groq_result = await self._analyze_with_groq(ocr_text)
                if groq_result.get("success"):
                    groq_result["data"]["ocr_text"] = ocr_text
                    return groq_result
                else:
                    logger.warning(f"FlowchartService: Groq failed: {groq_result.get('error')}")
            
            # If both failed, return error
            return {
                "success": False,
                "error": "Both Gemini and Groq APIs failed or not configured",
                "data": None
            }
                    
        except Exception as e:
            logger.error(f"Flowchart analysis error: {str(e)}")
            return {
                "success": False,
                "error": f"Flowchart analysis error: {str(e)}",
                "data": None
            }

    def _get_flowchart_prompt(self, ocr_text: str) -> str:
        """Generate the prompt for analyzing flowchart structure from OCR text"""
        return f"""You are an expert flowchart analyzer. Based on the OCR-extracted text from a handwritten flowchart image, reconstruct the flowchart structure.

**OCR EXTRACTED TEXT:**
{ocr_text}

**YOUR TASK:**
Analyze the OCR text and identify:
1. Start/End nodes (usually "Start", "End", "Begin", "Stop")
2. Process nodes (action steps, operations)
3. Decision nodes (questions, conditions with Yes/No or True/False)
4. The flow/connections between nodes (indicated by arrow descriptions or logical sequence)

**CRITICAL RULES:**
1. DIAMONDS = Decision nodes (if/else, yes/no questions) - MUST have 2 branches
2. RECTANGLES = Process nodes (actions, operations)
3. OVALS/ROUNDED = Start/End terminals
4. Infer connections from logical flow and any arrow indicators in the text

**OUTPUT FORMAT (JSON only, no explanation):**
```json
{{
  "elements": [
    {{
      "id": "start_1",
      "type": "start",
      "text": "Start",
      "shape": "oval",
      "position": {{"x": 200, "y": 50}},
      "connections_to": ["process_1"]
    }},
    {{
      "id": "process_1",
      "type": "process",
      "text": "Input N",
      "shape": "rectangle",
      "position": {{"x": 200, "y": 150}},
      "connections_to": ["decision_1"]
    }},
    {{
      "id": "decision_1",
      "type": "decision",
      "text": "N % 2 == 0?",
      "shape": "diamond",
      "position": {{"x": 200, "y": 250}},
      "connections_to": ["process_yes", "process_no"]
    }}
  ],
  "decision_branches": [
    {{
      "decision_id": "decision_1",
      "condition": "N % 2 == 0?",
      "yes_path": ["process_yes"],
      "no_path": ["process_no"]
    }}
  ],
  "flow_direction": "top_to_bottom",
  "title": "Flowchart Title",
  "description": "Brief description of what flowchart does"
}}
```

**POSITIONING:**
- Start at top: y=50, then increment by 100-150 for each level
- Center main flow at x=200
- Decision branches: Yes path at x=50, No path at x=350

Return ONLY the JSON structure."""

    async def _analyze_with_gemini_text(self, ocr_text: str) -> Dict[str, Any]:
        """Analyze flowchart structure using Gemini text API"""
        try:
            headers = {"Content-Type": "application/json"}
            prompt = self._get_flowchart_prompt(ocr_text)

            payload = {
                "contents": [
                    {
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "topP": 0.95,
                    "topK": 40,
                    "maxOutputTokens": 4096
                }
            }
            params = {"key": self.gemini_api_key}

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.gemini_base_url, headers=headers, params=params, json=payload)
                
                if response.status_code == 403:
                    return {
                        "success": False,
                        "error": "Gemini API key is invalid or quota exceeded",
                        "data": None
                    }
                elif response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Gemini API returned status {response.status_code}",
                        "data": None
                    }
                
                result = response.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                
                parsed_data = self._extract_json_from_response(content)
                if parsed_data:
                    validated_data = self._validate_flowchart_data(parsed_data)
                    return {
                        "success": True,
                        "error": None,
                        "data": {
                            "analysis": validated_data,
                            "raw_response": content,
                            "extraction_method": "ocr_plus_gemini_text"
                        }
                    }
                
                return {
                    "success": True,
                    "error": None,
                    "data": {
                        "analysis": {"raw_analysis": content},
                        "raw_response": content
                    }
                }
                
        except Exception as e:
            logger.error(f"Gemini text API error: {str(e)}")
            return {
                "success": False,
                "error": f"Gemini text API error: {str(e)}",
                "data": None
            }

    async def _analyze_with_groq(self, ocr_text: str) -> Dict[str, Any]:
        """Analyze flowchart structure using Groq API (fallback)"""
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.groq_api_key}"
            }
            prompt = self._get_flowchart_prompt(ocr_text)

            payload = {
                "model": self.groq_model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.1,
                "max_tokens": 4096
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.groq_base_url, headers=headers, json=payload)
                
                if response.status_code == 401:
                    return {
                        "success": False,
                        "error": "Groq API key is invalid",
                        "data": None
                    }
                elif response.status_code == 429:
                    return {
                        "success": False,
                        "error": "Groq API rate limit exceeded",
                        "data": None
                    }
                elif response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Groq API returned status {response.status_code}",
                        "data": None
                    }
                
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                parsed_data = self._extract_json_from_response(content)
                if parsed_data:
                    validated_data = self._validate_flowchart_data(parsed_data)
                    return {
                        "success": True,
                        "error": None,
                        "data": {
                            "analysis": validated_data,
                            "raw_response": content,
                            "extraction_method": "ocr_plus_groq"
                        }
                    }
                
                return {
                    "success": True,
                    "error": None,
                    "data": {
                        "analysis": {"raw_analysis": content},
                        "raw_response": content
                    }
                }
                
        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            return {
                "success": False,
                "error": f"Groq API error: {str(e)}",
                "data": None
            }

    async def _analyze_with_vision(self, image_bytes: bytes, filename: str = "flowchart.png") -> Dict[str, Any]:
        """
        Fallback: Analyze handwritten flowchart using Gemini Vision API directly.
        Used when OCR fails to extract meaningful text.
        """
        try:
            if not settings.is_gemini_configured():
                return {
                    "success": False,
                    "error": "Gemini API key not configured or service disabled",
                    "data": None
                }

            logger.info("GeminiFlowchartService: Using Vision API fallback")
            
            headers = {"Content-Type": "application/json"}
            prompt = """Analyze this handwritten flowchart image and extract its structure.

**RULES:**
1. DIAMONDS = Decision nodes (Yes/No branches)
2. RECTANGLES = Process nodes
3. OVALS = Start/End
4. Follow arrows for connections

**OUTPUT (JSON only):**
```json
{
  "elements": [
    {"id": "start_1", "type": "start", "text": "Start", "shape": "oval", "position": {"x": 200, "y": 50}, "connections_to": ["process_1"]}
  ],
  "decision_branches": [],
  "flow_direction": "top_to_bottom",
  "title": "Title",
  "description": "Description"
}
```

Return ONLY JSON."""

            # Convert image to base64
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            
            # Detect mime type
            mime_type = "image/png"
            if image_bytes[:3] == b'\xff\xd8\xff':
                mime_type = "image/jpeg"
            elif image_bytes[:4] == b'\x89PNG':
                mime_type = "image/png"
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"inline_data": {"mime_type": mime_type, "data": image_b64}},
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "topP": 0.95,
                    "topK": 40,
                    "maxOutputTokens": 4096
                }
            }
            params = {"key": self.gemini_api_key}

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.gemini_base_url, headers=headers, params=params, json=payload)
                
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Gemini Vision API returned status {response.status_code}",
                        "data": None
                    }
                
                result = response.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                
                parsed_data = self._extract_json_from_response(content)
                if parsed_data:
                    validated_data = self._validate_flowchart_data(parsed_data)
                    return {
                        "success": True,
                        "error": None,
                        "data": {
                            "analysis": validated_data,
                            "raw_response": content,
                            "extraction_method": "vision_api_fallback"
                        }
                    }
                
                return {
                    "success": True,
                    "error": None,
                    "data": {
                        "analysis": {"raw_analysis": content},
                        "raw_response": content
                    }
                }
                
        except Exception as e:
            logger.error(f"Gemini Vision API error: {str(e)}")
            return {
                "success": False,
                "error": f"Gemini Vision API error: {str(e)}",
                "data": None
            }

    async def improve_flowchart_structure(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Gemini to improve and standardize the flowchart structure analysis
        """
        try:
            if not settings.is_gemini_configured():
                return {
                    "success": False,
                    "error": "Gemini API not configured",
                    "data": None
                }

            prompt = f"""Optimize this flowchart structure for LaTeX generation. Fix any issues and improve clarity.

INPUT DATA:
{analysis_data}

TASKS:
1. Fix IDs: Use format start_1, process_1, decision_1, end_1
2. Fix types: oval→start/end, rectangle→process, diamond→decision
3. Clean text: Fix spelling, standardize operators (==, !=, %, &&, ||)
4. Validate connections: Every node should connect properly, no orphans
5. Decision branches: Every decision MUST have yes_path and no_path arrays
6. Optimize positions: Use 100-150px spacing, center main flow at x=200

OUTPUT (JSON only):
```json
{{
  "elements": [
    {{"id": "start_1", "type": "start", "text": "Start", "shape": "oval", "position": {{"x": 200, "y": 50}}, "connections_to": ["process_1"]}}
  ],
  "decision_branches": [
    {{"decision_id": "decision_1", "condition": "condition text", "yes_path": ["node_id"], "no_path": ["node_id"]}}
  ],
  "flow_direction": "top_to_bottom",
  "title": "Flowchart Title",
  "description": "What the flowchart does"
}}
```

Return ONLY the optimized JSON."""

            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "topP": 0.95,
                    "maxOutputTokens": 4096
                }
            }
            params = {"key": self.gemini_api_key}

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.gemini_base_url, headers=headers, params=params, json=payload)
                
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Gemini API returned status {response.status_code}",
                        "data": None
                    }
                
                try:
                    result = response.json()
                    content = result["candidates"][0]["content"]["parts"][0]["text"]
                    
                    return {
                        "success": True,
                        "error": None,
                        "data": {"improved_analysis": content}
                    }
                    
                except Exception as e:
                    logger.error(f"Failed to parse Gemini improvement response: {str(e)}")
                    return {
                        "success": False,
                        "error": "Failed to parse Gemini improvement response",
                        "data": None
                    }
                    
        except Exception as e:
            logger.error(f"Gemini improvement API error: {str(e)}")
            return {
                "success": False,
                "error": f"Gemini improvement API error: {str(e)}",
                "data": None
            }
    
    def _extract_json_from_response(self, content: str) -> Dict[str, Any]:
        """Enhanced JSON extraction with multiple parsing strategies"""
        import json
        import re
        
        # Strategy 1: Look for JSON code blocks
        json_blocks = re.findall(r'```json\s*(.*?)\s*```', content, re.DOTALL | re.IGNORECASE)
        for block in json_blocks:
            try:
                return json.loads(block.strip())
            except json.JSONDecodeError:
                continue
        
        # Strategy 2: Look for standalone JSON objects
        json_matches = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', content, re.DOTALL)
        for match in json_matches:
            try:
                parsed = json.loads(match.strip())
                if isinstance(parsed, dict) and 'elements' in parsed:
                    return parsed
            except json.JSONDecodeError:
                continue
        
        # Strategy 3: Extract nested JSON with balanced braces
        def find_balanced_json(text):
            start_idx = text.find('{')
            if start_idx == -1:
                return None
            
            brace_count = 0
            for i, char in enumerate(text[start_idx:]):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        try:
                            json_str = text[start_idx:start_idx + i + 1]
                            return json.loads(json_str)
                        except json.JSONDecodeError:
                            continue
            return None
        
        balanced_json = find_balanced_json(content)
        if balanced_json:
            return balanced_json
        
        return None
    
    def _validate_flowchart_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and enhance flowchart data structure"""
        
        if not isinstance(data, dict):
            return data
        
        # Ensure required fields exist
        validated_data = {
            "elements": data.get("elements", []),
            "flow_direction": data.get("flow_direction", "top_to_bottom"),
            "title": data.get("title"),
            "description": data.get("description", "")
        }
        
        # Validate elements structure
        valid_elements = []
        for i, element in enumerate(validated_data["elements"]):
            if isinstance(element, dict):
                valid_element = {
                    "id": str(element.get("id", f"node_{i+1}")),
                    "type": element.get("type", "process"),
                    "text": str(element.get("text", "")),
                    "position": element.get("position", {"x": 0, "y": i * 100}),
                    "shape": element.get("shape", "rectangle"),
                    "connections_to": element.get("connections_to", [])
                }
                
                # Ensure position has x and y
                if not isinstance(valid_element["position"], dict):
                    valid_element["position"] = {"x": 0, "y": i * 100}
                if "x" not in valid_element["position"]:
                    valid_element["position"]["x"] = 0
                if "y" not in valid_element["position"]:
                    valid_element["position"]["y"] = i * 100
                
                # Ensure connections_to is a list
                if not isinstance(valid_element["connections_to"], list):
                    valid_element["connections_to"] = []
                
                valid_elements.append(valid_element)
        
        validated_data["elements"] = valid_elements
        
        # CRITICAL: Validate and ensure decision branches for decision nodes
        decision_nodes = [elem for elem in valid_elements if elem["type"] == "decision"]
        decision_branches = data.get("decision_branches", [])
        
        # Ensure every decision node has corresponding decision branch
        validated_branches = []
        for decision_node in decision_nodes:
            # Find existing branch mapping
            existing_branch = None
            for branch in decision_branches:
                if branch.get("decision_id") == decision_node["id"]:
                    existing_branch = branch
                    break
            
            if existing_branch:
                validated_branches.append(existing_branch)
            else:
                # Create mandatory decision branch for missing decision nodes
                connections = decision_node.get("connections_to", [])
                if len(connections) >= 2:
                    # Split connections into Yes/No paths
                    yes_path = [connections[0]]
                    no_path = [connections[1]]
                elif len(connections) == 1:
                    # Default: first connection is Yes, create empty No path
                    yes_path = [connections[0]]
                    no_path = []
                else:
                    # No connections - create empty paths
                    yes_path = []
                    no_path = []
                
                # Create decision branch
                new_branch = {
                    "decision_id": decision_node["id"],
                    "yes_path": yes_path,
                    "no_path": no_path,
                    "condition": decision_node.get("text", "Decision")
                }
                validated_branches.append(new_branch)
                logger.info(f"Created missing decision branch for node {decision_node['id']}")
        
        # Always include decision_branches if we have decision nodes
        if decision_nodes:
            validated_data["decision_branches"] = validated_branches
            logger.info(f"Validated {len(validated_branches)} decision branches for {len(decision_nodes)} decision nodes")
        
        # Add other metadata if present  
        if "analysis_metadata" in data:
            validated_data["analysis_metadata"] = data["analysis_metadata"]
        
        return validated_data
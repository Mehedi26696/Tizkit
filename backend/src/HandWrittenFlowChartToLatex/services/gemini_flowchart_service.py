import httpx
import logging
import base64
from typing import Dict, Any, List
from src.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class GeminiFlowchartService:
    """Service for analyzing handwritten flowcharts using Gemini Flash 2.0"""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or ""
        self.base_url = settings.GEMINI_BASE_URL
        self.model = "gemini-2.0-flash"  # Gemini Flash 2.0
    
    async def analyze_handwritten_flowchart(self, image_bytes: bytes, filename: str = "flowchart.png") -> Dict[str, Any]:
        """
        Analyze handwritten flowchart image using Gemini Flash 2.0 vision model.
        Returns structured flowchart data with elements and connections.
        """
        try:
            if not settings.is_gemini_configured():
                return {
                    "success": False,
                    "error": "Gemini API key not configured or service disabled",
                    "data": None
                }

            headers = {"Content-Type": "application/json"}
            prompt = """
You are an advanced AI specialist in analyzing handwritten flowcharts and diagrams. Your task is to perform comprehensive analysis of this handwritten flowchart image with high accuracy and attention to detail.

## ANALYSIS OBJECTIVES:
1. **Shape Recognition**: Identify all flowchart shapes with 99% accuracy ⚠️ ESPECIALLY DIAMONDS!
2. **Text Extraction**: Extract ALL text content, including challenging handwriting
3. **Flow Analysis**: Map logical connections and decision paths ⚠️ CRITICAL: Find ALL decision branches!
4. **Conditional Logic Detection**: MANDATORY - Identify if this is a conditional flowchart with decision points
5. **Spatial Positioning**: Determine accurate relative positions for layout
6. **Semantic Understanding**: Understand the flowchart's purpose and logic

🎯 **PRIMARY MISSION**: If you see ANY diamond shapes or conditional logic (if/else, yes/no paths), this MUST be classified as a conditional flowchart with proper decision_branches mapping!

## SHAPE CLASSIFICATION GUIDE:
- **OVAL/ELLIPSE** → start/end nodes (terminals)
- **RECTANGLE/BOX** → process nodes (actions/operations)  
- **DIAMOND/RHOMBUS** → decision nodes (conditional logic) ⚠️ CRITICAL: Look for ANY diamond/rhombus shape!
- **CIRCLE** → connector nodes (join points)
- **PARALLELOGRAM** → input/output nodes
- **HEXAGON** → preparation nodes

⚠️ **DECISION DETECTION PRIORITY**: Diamonds are the most important shapes! Even rough, hand-drawn diamond-like shapes should be classified as decision nodes. Look for:
- Tilted squares (45° rotated rectangles)
- Rough diamond outlines
- Four-sided shapes that are wider than tall
- Any shape that looks like it could be a decision point

## TEXT EXTRACTION STRATEGIES:
- Read handwritten text carefully, considering context
- For unclear text, provide best interpretation with confidence
- Handle common handwriting variations (a/o, n/m, etc.)
- Extract programming symbols: ==, !=, %, &&, ||, etc.
- Preserve mathematical operators and comparison signs
- Maintain case sensitivity where apparent

## POSITIONING ALGORITHM:
- Use image coordinates (0,0 = top-left)
- Estimate positions in 50-pixel increments
- Consider visual layout: top-to-bottom, left-to-right flows
- Account for decision branch positioning (left/right splits)
- Maintain relative spatial relationships

## CONNECTION MAPPING:
⚠️ **DECISION BRANCH DETECTION IS CRITICAL**:
- Follow arrow directions precisely
- **MANDATORY**: Every decision diamond MUST have exactly 2 outgoing paths (Yes/No branches)
- Identify Yes/No branches (typically Yes=left/top, No=right/bottom)
- If you see a diamond with only 1 connection, look harder for the second branch!
- Map convergence points where paths rejoin
- Handle complex flows with multiple decision points

**BRANCH IDENTIFICATION RULES**:
- Left/Top branch → Usually "Yes" or "True"
- Right/Bottom branch → Usually "No" or "False"
- Look for handwritten "Y/N", "Yes/No", "T/F", or condition symbols near arrows
- If no labels visible, infer from spatial layout (left=Yes, right=No)

## ENHANCED JSON OUTPUT FORMAT:
```json
{
  "elements": [
    {
      "id": "start_1",
      "type": "start|process|decision|end|input|output|connector",
      "text": "extracted text content",
      "position": {"x": 250, "y": 50},
      "shape": "oval|rectangle|diamond|circle|parallelogram|hexagon",
      "connections_to": ["process_1", "decision_1"],
      "confidence": 0.95,
      "notes": "any interpretation details"
    }
  ],
  "flow_direction": "top_to_bottom|left_to_right|mixed",
  "complexity": "simple|moderate|complex",
  "title": "detected title or null",
  "description": "comprehensive flowchart purpose and logic",
  "decision_branches": [
    {
      "decision_id": "decision_1",
      "yes_path": ["process_2"],
      "no_path": ["process_3"],
      "condition": "extracted condition text"
    }
  ],
  "analysis_metadata": {
    "total_nodes": 6,
    "decision_points": 1,
    "start_nodes": 1,
    "end_nodes": 1,
    "estimated_accuracy": 0.92
  }
}
```

## QUALITY ASSURANCE CHECKLIST:
✓ All visible shapes identified and classified
✓ All text extracted with best-effort accuracy  
✓ Logical flow paths mapped correctly
✓ Decision branches clearly defined with conditions
✓ Spatial positioning maintains visual relationships
✓ JSON structure is valid and complete
✓ Analysis reflects actual flowchart logic

## SPECIAL HANDLING:
- **Poor handwriting**: Provide best interpretation + confidence score
- **Ambiguous shapes**: Use context clues and surrounding elements
- **Missing arrows**: Infer logical connections from spatial layout
- **Complex conditions**: Extract full conditional expressions
- **Multiple paths**: Map all possible execution flows
- **Nested logic**: Handle sub-processes and loops

## EXAMPLE ANALYSIS:
For a simple number checking flowchart:
- START → "Begin Program"
- PROCESS → "Input Number N" 
- DECISION → "Is N % 2 == 0?" (MUST have 2 branches: Yes path and No path)
- PROCESS_YES → "Display: Even Number" (connected from Yes branch)
- PROCESS_NO → "Display: Odd Number" (connected from No branch)
- END → "End Program"

**DECISION BRANCHES MUST LOOK LIKE**:
```json
"decision_branches": [
  {
    "decision_id": "decision_1",
    "yes_path": ["process_yes", "end_1"],
    "no_path": ["process_no", "end_1"],
    "condition": "Is N % 2 == 0?"
  }
]
```

⚠️ **VALIDATION RULES**:
- Every decision node MUST appear in decision_branches array
- Every decision MUST have both yes_path and no_path (even if one is empty)
- If you don't see clear Yes/No labels, create logical branches based on spatial layout
- PROCESS (Yes) → "Display 'Even'"
- PROCESS (No) → "Display 'Odd'" 
- END → "Stop"

Analyze the provided flowchart image with this comprehensive approach and return the detailed JSON analysis."""

            # Convert image to base64
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt},
                            {"inline_data": {"mime_type": "image/png", "data": image_b64}}
                        ]
                    }
                ]
            }
            params = {"key": self.api_key}

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.base_url, headers=headers, params=params, json=payload)
                
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
                
                try:
                    result = response.json()
                    content = result["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Try to extract JSON from the response
                    import json
                    import re
                    
                    # Enhanced JSON extraction with multiple strategies
                    parsed_data = self._extract_json_from_response(content)
                    if parsed_data:
                        # Validate and enhance the parsed data
                        validated_data = self._validate_flowchart_data(parsed_data)
                        return {
                            "success": True,
                            "error": None,
                            "data": {
                                "analysis": validated_data,
                                "raw_response": content,
                                "extraction_method": "enhanced_json_parsing"
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
                    logger.error(f"Failed to parse Gemini vision response: {str(e)}")
                    return {
                        "success": False,
                        "error": "Failed to parse Gemini vision response",
                        "data": None
                    }
                    
        except Exception as e:
            logger.error(f"Gemini vision API error: {str(e)}")
            return {
                "success": False,
                "error": f"Gemini vision API error: {str(e)}",
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

            prompt = f"""
You are a flowchart optimization expert. Analyze and enhance this flowchart data for maximum clarity and accuracy.

## ORIGINAL ANALYSIS:
{analysis_data}

## OPTIMIZATION TASKS:

### 1. **ID STANDARDIZATION**
- Ensure unique, descriptive IDs (start_1, process_2, decision_1, end_1)
- Follow semantic naming conventions
- Fix any duplicate or missing IDs

### 2. **TYPE VALIDATION** 
- Verify shape-to-type mapping accuracy:
  * Oval shapes → start/end types
  * Rectangles → process types  
  * Diamonds → decision types
- Correct any misclassifications

### 3. **TEXT OPTIMIZATION**
- Clean up extracted text (remove artifacts, fix spacing)
- Standardize programming syntax (==, !=, &&, ||, %)
- Improve readability while preserving meaning
- Fix obvious spelling/transcription errors

### 4. **CONNECTION LOGIC VALIDATION**
- Verify all connections follow logical flow
- Ensure decision nodes have proper Yes/No branches
- Check for orphaned nodes or missing connections
- Validate start→process→decision→end flow patterns

### 5. **POSITIONING REFINEMENT**
- Optimize coordinates for visual clarity
- Ensure proper spacing between connected nodes
- Align decision branches symmetrically
- Maintain logical top-to-bottom or left-to-right flow

### 6. **STRUCTURAL INTEGRITY**
- Add missing essential elements (start/end nodes)
- Remove duplicate or redundant elements
- Ensure single start point and clear end point(s)
- Fix broken connection chains

### 7. **DECISION BRANCH ENHANCEMENT**
- Clearly define Yes/No paths for all decisions
- Extract and clarify conditional expressions
- Ensure branch paths converge properly
- Add missing branch labels if inferrable

## ENHANCED OUTPUT REQUIREMENTS:

Return the optimized analysis with these improvements:

```json
{
  "elements": [...], // Optimized elements array
  "flow_direction": "...", // Validated direction
  "title": "...", // Cleaned title
  "description": "...", // Enhanced description
  "decision_branches": [...], // Clarified branches
  "optimization_log": [
    "Fixed duplicate IDs in nodes 2 and 3",
    "Corrected decision type for diamond shape",
    "Enhanced text readability for condition",
    "Added missing connection from process to end",
    "Standardized coordinate positioning"
  ],
  "quality_score": 0.95, // Overall accuracy estimate
  "recommendations": [
    "Consider adding error handling path",
    "Condition could be more specific"
  ]
}
```

## QUALITY STANDARDS:
- ✅ All nodes have unique, meaningful IDs
- ✅ Shape types match visual appearance  
- ✅ Text is clean and readable
- ✅ All logical paths are connected
- ✅ Decision branches are clearly defined
- ✅ Flow follows standard flowchart conventions
- ✅ Positioning supports visual clarity

Focus on improving accuracy, completeness, and logical consistency while preserving the original flowchart's intent and structure."""

            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {
                        "parts": [{"text": prompt}]
                    }
                ]
            }
            params = {"key": self.api_key}

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, headers=headers, params=params, json=payload)
                
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
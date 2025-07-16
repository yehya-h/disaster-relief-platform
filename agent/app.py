import json
from flask import Flask, request, jsonify
import google.generativeai as genai
from pydantic import BaseModel, ValidationError

# Setup your API key
genai.configure(api_key="AIzaSyD7U0uXcPXrlMnUi-_AeBOaWjf7ZnK55G0")

# Create the model instance
model = genai.GenerativeModel("gemini-2.5-flash")

app = Flask(__name__)

class ImageOutput(BaseModel):
    disaster_probability: float
    disaster_type: str
    disaster_severity: str
    reasoning: str

@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    file = request.files['image']

    img_bytes = file.read()
    input_desc = request.form['description']
    input_type = request.form['type']
    input_severity = request.form['severity']

    # instructions = """
    # You are an intelligent disaster classification agent.
    #
    # - Carefully analyze the image content.
    # - Determine if it depicts a disaster that has an impact on the surrounding environment or nearby area,
    # not just affecting a single person. For example, a building on fire, widespread flooding,
    # a collapsed street, or smoke covering an area. Avoid labeling isolated incidents that impact only one individual as disasters.
    #
    # - Additionally, analyze the style and quality of the image to detect if it is likely AI-generated, a cartoon, or otherwise artificial.
    # If the image appears to be AI-generated or cartoon-like, reduce the probability substantially
    # (for example to a range between 0.0 and 0.6 depending on how clear it is).
    # If you are confident it is purely artificial or cartoon-like, return a probability close to 0.0.
    #
    # - If it does depict a real disaster affecting the environment, estimate the probability (between 0.0 and 1.0).
    #
    # - Also classify the type of disaster (such as fire, flood, earthquake, landslide, storm, hurricane, explosion, etc),
    # or return "unknown" if not recognized or if not a disaster, then compare with the one provided by the user which eventually affects the probability.
    #
    # -You also have to give an estimated severity such as 'low', 'medium', 'high', 'critical', then compare with the one provided by the user which eventually affects the probability.
    #
    # -You have to provide a detailed reasoning for the generated proba, type and severity and fill it in the reasoning field
    # - Always respond in this exact JSON format, Return only the JSON object, with no additional commentary, markdown, or explanations:
    # {
    # "disaster_probability": <number between 0.0 and 1.0>,
    # "disaster_type": "<string such as 'fire', 'flood', or 'unknown'>",
    # "disaster_severity": "<string such as 'low', 'medium', 'high', 'critical'>",
    # "reasoning": "<string>"
    # }
    # """

    instructions = """
    You are an intelligent disaster classification agent.
    Here is an image to analyze.
    Task: Analyze the image and return only a JSON object with these fields:
    - disaster_probability (float 0.0–1.0): confidence score
    - disaster_type (string): one of the defined types
    - disaster_severity (string): Low | Medium | High (based solely on human impact)
    - reasoning (string): one-sentence rationale referencing people-risk factors, also the reasoning of the generated probability

    IMPORTANT: Respond ONLY with the JSON object, no markdown, no commentary, no preface, no trailing notes.
    Additionally, compare the detected type and severity with the user-provided type and severity. If they significantly differ, mention that in the reasoning.

    —Definition of Incident—
    An incident is any unplanned hazardous event that poses a threat to people, property, or the environment. Look for these visual cues:
    1. Earthquake – collapsed walls, tilted structures, rubble
    2. Flood – water covering roads, buildings, people wading
    3. Wildfire – flames, smoke plumes, burning vegetation
    4. Building Collapse – fallen beams, crushed vehicles, debris field
    5. Urban/Industrial Fire – localized flames, billowing smoke from structures
    6. Traffic Accident – damaged vehicles, skid marks, injured persons roadside
    7. Chemical Spill / Hazardous Material – colored liquid pooling, warning placards
    8. Medical Emergency – person lying motionless, first-responder activity
    9. Armed Conflict / Explosion – blast damage, smoke clouds, armed individuals
    10. Disease Outbreak – people wearing masks, medical tents, crowded clinics
    11. Other – any other hazard not covered above

    —People Impact Danger Levels—
    Evaluate human risk by these thresholds:
    - Low: ≤ 2 people exposed, no visible distress or injury
    - Medium: 3–10 people exposed, some alarm, minor injuries or difficulty moving
    - High: > 10 people exposed, visible panic, serious injury, or life‑threatening conditions
    
    - Additionally, analyze the style and quality of the image to detect if it is likely AI-generated, a cartoon, or otherwise artificial.
    If the image appears to be AI-generated or cartoon-like, reduce the probability substantially
    If you are confident it is purely artificial or cartoon-like, return a probability close to 0.0.
    

    —Error Handling—
    If disaster_probability < 0.2, set:
    json
    {
    "disaster_probability": <value>,
    "disaster_type": "Other",
    "disaster_severity": "Low",
    "reasoning": "Low confidence in any hazardous conditions."
    }
    """

    # Call the model
    response = model.generate_content(
        [
            {"mime_type": "image/jpeg", "data": img_bytes},
            instructions,
            f"Extra details provided by user: "
            f"type of incident = '{input_type}', "
            f"severity reported = '{input_severity}'."
        ]
    )
    print(response.text)

    # Clean response text and parse it into actual JSON
    raw_text = response.text.strip()
    if raw_text.startswith("```json"):
        raw_text = raw_text.removeprefix("```json").removesuffix("```").strip()

    try:
        json_data = json.loads(raw_text)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse model response as JSON", "raw": raw_text}), 500

    try:
        image_result = ImageOutput(
            disaster_type=json_data.get("disaster_type", "unknown"),
            disaster_probability=json_data.get("disaster_probability", 0.0),
            disaster_severity=json_data.get("disaster_severity","unknown"),
            reasoning=json_data.get("reasoning", "unknown"),
        )
    except ValidationError as e:
        return jsonify({"error": "Output format invalid", "details": e.errors()}), 500

    print(image_result)
    return jsonify(image_result.model_dump())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

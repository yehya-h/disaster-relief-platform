import json
from flask import Flask, request, jsonify
import google.generativeai as genai
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
import os
from PIL import Image
import io
import requests

load_dotenv()
GOOGLE_API_KEY=os.getenv("GOOGLE_API_KEY")

types = []

# Setup your API key
genai.configure(api_key=GOOGLE_API_KEY)

# Create the model instance
model = genai.GenerativeModel("gemini-2.5-flash")

app = Flask(__name__)

class ImageOutput(BaseModel):
    disaster_probability: float
    disaster_type: str
    disaster_severity: str
    reasoning: str

class DescOutput(BaseModel):
    description_similarity_score: float
    reformulated_description: str

class FinalOutput(BaseModel):
    is_incident: bool
    probability: float
    reformulated_description: str
    type: str
    severity: str
    reasoning: str

def fetch_disaster_types():
    print("Fetching Disaster Types")
    NODE_API = os.getenv("NODE_API")
    global types

    if not NODE_API:
        raise EnvironmentError("NODE_API is not set in environment variables.")

    url = f"{NODE_API}/types"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        # Extract only the 'name' fields
        type_names = [item["name"] for item in data if "name" in item]
        print(f"type_names: {type_names}")
        return type_names
        # return ["Fire", "flood", "earthquake", "tornado", "volcano", "car crash"]

    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch types: {e}")
        return []


def format_size(bytes_len):
    kb = bytes_len / 1024
    mb = kb / 1024
    return f"{kb:.2f} KB", f"{mb:.2f} MB"
#
# def compress_image(image_bytes, max_size=(1024, 1024), quality=90):
#     # Original size
#     original_size_bytes = len(image_bytes)
#     original_kb, original_mb = format_size(original_size_bytes)
#     print(f"Original size: {original_kb} ({original_mb})")
#
#     image = Image.open(io.BytesIO(image_bytes))
#
#     # Convert to RGB (to avoid issues with PNG or transparency)
#     if image.mode != "RGB":
#         image = image.convert("RGB")
#
#     # Resize the image
#     image.thumbnail(max_size)  # Preserves aspect ratio
#
#     # Save it into bytes again
#     output_buffer = io.BytesIO()
#     image.save(output_buffer, format='JPEG', quality=quality, optimize=True)
#
#     compressed_bytes = output_buffer.getvalue()
#     compressed_size_bytes = len(compressed_bytes)
#     compressed_kb, compressed_mb = format_size(compressed_size_bytes)
#     print(f"Compressed size: {compressed_kb} ({compressed_mb})")
#
#     return compressed_bytes

@app.route("/analyze", methods=["POST"])
def analyze():
    global types
    file = request.files['image']
    img_bytes = file.read()
    # compressed_img = compress_image(img_bytes)
    input_desc = request.form['description']
    input_type = request.form['type']
    input_severity = request.form['severity']
    desc_empty = False

    print(f"============>NEW REQUEST <===============")
    print(f"input_desc: {input_desc} ||image size: {format_size(file.tell())} ||({input_type}) ||{input_severity}")

    # types = ['fire', 'flood', 'earthquake', 'tornado', 'volcano', 'car crash']
    if not types:
        types = fetch_disaster_types()

    demo_instructions = """
    You are an intelligent disaster classification agent tasked with evaluating whether an image represents a real-world disaster incident.
    THIS IS A DEMO/TESTING, SO SCREEN CAPTURED IMAGES ARE ACCEPTABLE IF THEY'RE NOT AI-GENERATED OR FAKE OR CARTOON
    You must output a clean, valid JSON object with the following fields:

    - disaster_probability (float between 0.0 and 1.0): overall confidence score based on visual and metadata inputs.
    - disaster_type (string): type of disaster, selected from a list provided at the end.
    - disaster_severity (string): Low | Medium | High (based on visible human impact and potential harm).
    - reasoning (string): a short, descriptive paragraph describing what is seen in the image — include visible elements (e.g. smoke, people, buildings),
      estimated risk level, and any clues of the disaster type or artificiality.
      This will be shown to users if no description is provided, and may be compared against user-submitted descriptions.

    Your analysis must follow these guidelines:

    1 - Image Analysis Weighting
    Disaster probability must be calculated based on:
    - 80% based on image analysis (visual evidence of disaster conditions, human impact, environmental damage)
    - 10% based on user-provided type matching your detected type
     - Full 10% if types match exactly
     - Proportional reduction for mismatches (e.g., -5% for related types, -10% for completely different types)
     -Important Note: If the disaster type doesn't clearly match any provided category, select the closest match or "other" 
      if available. The disaster_probability should always reflect the actual level of harm and risk visible in the image, 
      regardless of whether it fits predefined categories perfectly.
    - Variable percentage based on your assessed severity level (maximum is 10%):
     - 3% if you assess the severity as Low
     - 6% if you assess the severity as Medium  
     - 10% if you assess the severity as High
    - Never exceed the total combined weighted score


     2 - Source Validation: Ensure Live, Real-World Imagery**
        - This system is designed only for real, live-captured disaster scenes.
        - Images with any of the following characteristics must be penalized heavily:
            - Stock photo watermarks (Adobe Stock, Shutterstock, Getty Images, iStock, etc.)
            - Obviously staged or studio-quality scenes
            - Cartoon, animated, or clearly AI-generated content
            - Unrealistic physics, perfect symmetry, or over-saturated colors
            - Video game screenshots or rendered graphics
            - Obvious visual effects or CGI elements
            - Historical archive images (unless specified as acceptable)
        - If an image has visible stock photo markings or is clearly from a commercial database, it must be classified as non-live and treated as artificial**.
        - In such cases, reduce the disaster probability significantly** or to **near 0.0 if clearly fake or non-live.**


    3 - Demo / Testing Allowance
        If the prompt or metadata indicates the image is part of a test/demo, and the image is captured from a screen (e.g. laptop), proceed normally **as long as** the content appears realistic and consistent with a true disaster.
        - Do not penalize for screen glare, pixels, or reflection **if** the disaster is clearly visible and real and in the prompt it's stated that this is a demo;
        However, if the image is clearly fake, cartoon, or AI-generated — still reduce the score, even during testing.
        - In short: demo/test context allows screen-captured content, but not fake-looking content.


    4 - Severity and Disaster Evaluation: Human Impact & Potential Harm
    The presence of ANY of the indicators listed below should increase the disaster probability, as they represent genuine disaster conditions or emergency situations.
    Severity determines the SCALE of impact, not whether it qualifies as a disaster.
    - Low Severity:
    • 1–2 people affected or nearby, appearing calm or uninjured.
    • No visible injuries or panic.
    • Minimal disruption: minor fire, small flood area, isolated car crash, light smoke, or localized damage.
    • No emergency services visible, traffic flowing normally.

    - Medium Severity:
    • 3–10 people present, some showing concern, discomfort, or minor injuries.
    • Moderate disruption: partial road blockage, interior damage, localized evacuation, medium smoke, flood reaching buildings.
    • Some emergency or safety response may be visible (e.g. people helping each other, flashing lights).
    • Traffic may be delayed, people may be gathering or evacuating.

    - High Severity:
    • More than 10 people affected or visible panic, chaos, serious injuries, or people lying down.
    • Severe disruption: collapsed structures, large-scale fire, deep floodwaters, blocked roads, explosion aftermath.
    • Emergency services like fire trucks, ambulances, or crowd control are clearly present.
    • Strong environmental impact — thick smoke, major debris, evacuations in progress, or visible risk to lives.

    Base your assessment strictly on what can be seen in the image or what might happen in the very near future if not handled — do not infer unseen casualties or unseen damage.

    5 - Output Format
    Only return a valid JSON object. Do not wrap it in markdown or explanation. No preface, no commentary.

    {
        "disaster_probability": <number between 0.0 and 1.0>,
        "disaster_type": "<string such as 'flood', 'fire', or 'other' from the list of types provided later on>",
        "disaster_severity": "<string: 'Low', 'Medium', or 'High'>",
        "reasoning": "<clear, natural-sounding sentence explaining your decision>"
    }
    """

    non_demo_instructions = """
    You are an intelligent disaster classification agent tasked with evaluating whether an image represents a real-world disaster incident.
    THIS IS NOT A DEMO OR A TESTING, SO NO SCREEN CAPTURED IMAGES ARE ACCEPTABLE, STRONGLY PENALIZE FOR SCREEN GLARE, PIXELS OR REFLECTION (Image Analysis Probability should be near 0% out of 80%)
    You must output a clean, valid JSON object with the following fields:

    - disaster_probability (float between 0.0 and 1.0): overall confidence score based on visual and metadata inputs.
    - disaster_type (string): type of disaster, selected from a list provided at the end.
    - disaster_severity (string): Low | Medium | High (based on visible human impact and potential harm).
    - reasoning (string): a short, descriptive paragraph describing what is seen in the image — include visible elements (e.g. smoke, people, buildings),
      estimated risk level, and any clues of the disaster type or artificiality.
      This will be shown to users if no description is provided, and may be compared against user-submitted descriptions.

    Your analysis must follow these guidelines:

    1 - Image Analysis Weighting
    Disaster probability must be calculated based on:
    - 80% based on image analysis (visual evidence of disaster conditions, human impact, environmental damage)
    - 10% based on user-provided type matching your detected type
     - Full 10% if types match exactly
     - Proportional reduction for mismatches (e.g., -5% for related types, -10% for completely different types)
     -Important Note: If the disaster type doesn't clearly match any provided category, select the closest match or "other" 
      if available. The disaster_probability should always reflect the actual level of harm and risk visible in the image, 
      regardless of whether it fits predefined categories perfectly.
    - Variable percentage based on your assessed severity level (maximum is 10%):
     - 3% if you assess the severity as Low
     - 6% if you assess the severity as Medium  
     - 10% if you assess the severity as High
    - Never exceed the total combined weighted score


     2 - Source Validation: Ensure Live, Real-World Imagery**
        - This system is designed only for real, live-captured disaster scenes.
        - Images with any of the following characteristics must be penalized heavily:
            - Stock photo watermarks (Adobe Stock, Shutterstock, Getty Images, iStock, etc.)
            - Obviously staged or studio-quality scenes
            - Cartoon, animated, or clearly AI-generated content
            - Unrealistic physics, perfect symmetry, or over-saturated colors
            - Video game screenshots or rendered graphics
            - Obvious visual effects or CGI elements
            - Historical archive images (unless specified as acceptable)
        - If an image has visible stock photo markings or is clearly from a commercial database, it must be classified as non-live and treated as artificial**.
        - In such cases, reduce the disaster probability significantly** or to **near 0.0 if clearly fake or non-live.**


    3 - Demo / Testing Allowance
        If the prompt or metadata indicates the image is part of a test/demo, and the image is captured from a screen (e.g. laptop), proceed normally **as long as** the content appears realistic and consistent with a true disaster.
        - Do not penalize for screen glare, pixels, or reflection **if** the disaster is clearly visible and real and in the prompt it's stated that this is a demo;
        However, if the image is clearly fake, cartoon, or AI-generated — still reduce the score, even during testing.
        - In short: demo/test context allows screen-captured content, but not fake-looking content.


    4 - Severity and Disaster Evaluation: Human Impact & Potential Harm
    Determine the severity level by analyzing visible human exposure, emotional or physical distress, and environmental or situational consequences in the image.
    The presence of ANY of the indicators listed below should increase the disaster probability, as they represent genuine disaster conditions or emergency situations.
    Severity determines the SCALE of impact, not whether it qualifies as a disaster.
    - Low Severity:
    • 1–2 people affected or nearby, appearing calm or uninjured.
    • No visible injuries or panic.
    • Minimal disruption: minor fire, small flood area, isolated car crash, light smoke, or localized damage.
    • No emergency services visible, traffic flowing normally.

    - Medium Severity:
    • 3–10 people present, some showing concern, discomfort, or minor injuries.
    • Moderate disruption: partial road blockage, interior damage, localized evacuation, medium smoke, flood reaching buildings.
    • Some emergency or safety response may be visible (e.g. people helping each other, flashing lights).
    • Traffic may be delayed, people may be gathering or evacuating.

    - High Severity:
    • More than 10 people affected or visible panic, chaos, serious injuries, or people lying down.
    • Severe disruption: collapsed structures, large-scale fire, deep floodwaters, blocked roads, explosion aftermath.
    • Emergency services like fire trucks, ambulances, or crowd control are clearly present.
    • Strong environmental impact — thick smoke, major debris, evacuations in progress, or visible risk to lives.

    Base your assessment strictly on what can be seen in the image or what might happen in the very near future if not handled — do not infer unseen casualties or unseen damage.

    5 - Output Format
    Only return a valid JSON object. Do not wrap it in markdown or explanation. No preface, no commentary.

    {
        "disaster_probability": <number between 0.0 and 1.0>,
        "disaster_type": "<string such as 'flood', 'fire', or 'other' from the list of types provided later on>",
        "disaster_severity": "<string: 'Low', 'Medium', or 'High'>",
        "reasoning": "<clear, natural-sounding sentence explaining your decision>"
    }
    """

    demo_instructions += "here's a list of the possible incident types to consider while examining the image: " + ", ".join(types) + "."
    non_demo_instructions += "here's a list of the possible incident types to consider while examining the image: " + ", ".join(types) + "."


    # Call the model
    response = model.generate_content(
        [
            {"mime_type": "image/jpeg", "data": img_bytes},
            demo_instructions,
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

    if input_desc.strip() == "":
        desc_empty = True
        desc_instructions = """
        You are an expert in writing incident summaries for media-news platforms.

        Your task is to reformulate your reasoning into a short, clear, and natural-sounding paragraph
        describing the detected disaster incident.

        This paragraph should:
        - Describe the type of disaster (e.g. flood, fire).
        - Mention the estimated severity (Low, Medium, High) based on visible human impact.
        - Be written like a news post or report caption — not a raw image description.
        - Be engaging, readable, and suitable for the public to understand what is happening in the scene.

        Do NOT:
        - Mention that this was AI-generated.
        - Include any technical image analysis.
        - Reference any internal system processes or prompts.
        - Use any formatting symbols like **, *, _, ##, or similar markup.
        - Use special characters except basic punctuation (periods, commas, question marks, exclamation marks).
        - Include brackets, parentheses for emphasis, or technical notation.
        
        Text Formatting Requirements:
        - Use only letters, numbers, and basic punctuation (. , ? ! : ;)
        - Write in plain text without any bold, italic, or special formatting
        - Keep language natural and conversational
    
        Examples to Follow (Structure and language Reference):    
        NOTE: Descriptions must be based solely on directly observable details from the scene (e.g., visible damage, environmental conditions). 
        Avoid assumptions about: 
            - Emergency responses (e.g., "rescuers are en route") unless explicitly stated in the reasoning.
            - Casualty numbers or human impact without clear evidence.
            - Unconfirmed causes (e.g., "the bomb was planted by...").
            
        **Example 1:**
        [Severe flooding submerges neighborhood, trapping vehicles and damaging homes. 
        Rising waters have engulfed streets, partially covering a white car, with trees and houses visibly affected.]
    
        **Example 2:**
        [Deadly building collapse leaves area in ruins as rescue efforts continue. A multi-story structure has crumbled into a massive heap of debris, 
        with emergency crews working tirelessly to search for survivors. Heavy machinery and onlookers crowd the scene amid fears of further instability.]
        
        **Example 3:**
        [A large-scale wildfire is fiercely burning across a forested mountainside, sending extensive flames and dense smoke into the sky. 
        This high-severity incident poses a significant threat to the natural environment and potentially nearby human infrastructure.]
        
        **Example 4:**
        [Explosion rocks city center, leaving chaos and casualties in its wake. A powerful bomb detonated in a crowded district, shattering buildings and scattering debris across streets. 
        Emergency teams rush to treat the wounded amid reports of multiple fatalities.]

        Output only this JSON:
        {
          "description_similarity_score": -1,
          "reformulated_description": "<natural incident summary>"
        }
        """
    else:
        desc_instructions = f"""
        The user provided the following description of an incident image: "{input_desc}"

        Your task:
        1. Analyze the image and form your own reasoning about the scene.
        2. Compare the user-provided description to your reasoning.
        3. Estimate a similarity score (float between 0.0 and 1.0) based on:
        - Whether the description accurately reflects the type of disaster, its severity, and visible impact.
        - Whether the description captures the correct context, even if wording is different.
        - Do NOT penalize for grammar, paraphrasing, or missing minor details.

        IMPORTANT:
        - A score of **1.0** means the user's description is truthful, contextually appropriate, and conveys the correct disaster type and severity.
        - A score of **0.5–0.9** is for descriptions that are mostly accurate but may lack detail.
        - A score **< 0.5** is only for clearly mismatched, false, or irrelevant descriptions.

        This paragraph should:
        - Describe the type of disaster (e.g. flood, fire).
        - Mention the estimated severity (Low, Medium, High) based on visible human impact.
        - Be styled like a news incident summary, not a dry technical or visual description.
        - Focus on the event and its implications — use simple language, and avoid technical terms or image-analysis details.
        
                Do NOT:
        - Mention that this was AI-generated.
        - Include any technical image analysis.
        - Reference any internal system processes or prompts.
        - Use any formatting symbols like **, *, _, ##, or similar markup.
        - Use special characters except basic punctuation (periods, commas, question marks, exclamation marks).
        - Include brackets, parentheses for emphasis, or technical notation.
        
        Text Formatting Requirements:
        - Use only letters, numbers, and basic punctuation (. , ? ! : ;)
        - Write in plain text without any bold, italic, or special formatting
        - Keep language natural and conversational
    
        Examples to Follow (Structure and language Reference):    
        NOTE: Descriptions must be based solely on directly observable details from the scene (e.g., visible damage, environmental conditions). 
        Avoid assumptions about: 
            - Emergency responses (e.g., "rescuers are en route") unless explicitly stated in the reasoning.
            - Casualty numbers or human impact without clear evidence.
            - Unconfirmed causes (e.g., "the bomb was planted by...").
            
        **Example 1:**
        [Severe flooding submerges neighborhood, trapping vehicles and damaging homes. 
        Rising waters have engulfed streets, partially covering a white car, with trees and houses visibly affected.]
    
        **Example 2:**
        [Deadly building collapse leaves area in ruins as rescue efforts continue. A multi-story structure has crumbled into a massive heap of debris, 
        with emergency crews working tirelessly to search for survivors. Heavy machinery and onlookers crowd the scene amid fears of further instability.]
        
        **Example 3:**
        [A large-scale wildfire is fiercely burning across a forested mountainside, sending extensive flames and dense smoke into the sky. 
        This high-severity incident poses a significant threat to the natural environment and potentially nearby human infrastructure.]
        
        **Example 4:**
        [Explosion rocks city center, leaving chaos and casualties in its wake. A powerful bomb detonated in a crowded district, shattering buildings and scattering debris across streets. 
        Emergency teams rush to treat the wounded amid reports of multiple fatalities.]

        Output only this JSON:
        
        {{
          "description_similarity_score": <float between 0.0 and 1.0>,
          "reformulated_description": "<natural incident summary>"
        }}
        """

    # Call the model
    desc_response = model.generate_content(
        [
            desc_instructions,
            f"Reasoning generated from analyzing the image: {image_result.reasoning} "
        ]
    )
    print(desc_response.text)

    # Clean response text and parse it into actual JSON
    desc_raw_text = desc_response.text.strip()
    if desc_raw_text.startswith("```json"):
        desc_raw_text = desc_raw_text.removeprefix("```json").removesuffix("```").strip()

    try:
        json_data = json.loads(desc_raw_text)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse model response as JSON", "raw": desc_raw_text}), 500

    try:
        desc_result = DescOutput(
            description_similarity_score=json_data.get("description_similarity_score", 0.0),
            reformulated_description=json_data.get("reformulated_description", "no description")
        )
    except ValidationError as e:
        return jsonify({"error": "Output format invalid", "details": e.errors()}), 500

    print(desc_result)

    if image_result.disaster_probability == 0.0:
        proba = 0.0
    elif desc_empty == True:
        proba = image_result.disaster_probability
    else:
        proba = image_result.disaster_probability*0.8 + desc_result.description_similarity_score*0.2

    if proba <0.6:
        is_incident = False
    else:
        is_incident = True
    desc = desc_result.reformulated_description

    try:
        final_result = FinalOutput(
            is_incident= is_incident,
            probability= proba,
            reformulated_description= desc,
            type = image_result.disaster_type,
            severity= image_result.disaster_severity,
            reasoning= image_result.reasoning
        )
    except ValidationError as e:
        return jsonify({"error": "Output format invalid", "details": e.errors()}), 500

    return jsonify(final_result.model_dump())

@app.route("/refresh-types", methods=["GET"])
def refresh_types():
    """Manually refresh the types list from Node API"""
    fetch_disaster_types()
    return jsonify({"message": "Types refreshed.", "types": types})

with app.app_context():
    fetch_disaster_types()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, threaded=True)

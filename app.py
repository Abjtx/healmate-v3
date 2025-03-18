import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import openai
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder=".")
CORS(app)

# Load the OpenAI API key from environment variables
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("No OpenAI API key found in environment variables")
print("API Key Loaded:", api_key[:5] + "..." + api_key[-5:])  # Debug: Show just a portion of the API key for security

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

# List of urgent symptoms that require immediate medical attention
URGENT_SYMPTOMS = [
    "chest pain", "difficulty breathing", "shortness of breath", "severe bleeding",
    "sudden severe headache", "sudden numbness", "paralysis", "seizure", "unconscious",
    "unresponsive", "stroke", "heart attack", "severe abdominal pain", "coughing blood",
    "vomiting blood", "suicidal thoughts", "severe burn", "electric shock", "drowning",
    "deep wound", "head injury", "broken bone", "dislocated joint", "poisoning",
    "overdose", "anaphylaxis", "allergic reaction"
]

# Function to check for urgent symptoms
def check_for_urgent_symptoms(message):
    message_lower = message.lower()
    found_urgent_symptoms = [symptom for symptom in URGENT_SYMPTOMS if symptom in message_lower]
    
    return {
        "isUrgent": len(found_urgent_symptoms) > 0,
        "urgentSymptoms": found_urgent_symptoms
    }

# API endpoint for the chat
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        print("Received message:", message)

        if not message:
            return jsonify({"error": "Message is required"}), 400

        urgency_check = check_for_urgent_symptoms(message)
        
        # OpenAI API call using the latest client format
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a medical symptom analysis assistant. Analyze the user's symptoms and provide a preliminary assessment. Be compassionate and informative. If you identify any potentially serious symptoms, note them, but always advise the user to consult with a healthcare professional for proper diagnosis and treatment. Never provide a definitive diagnosis or specific treatment recommendations. Always include disclaimers about the limitations of this analysis."},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            # Extract the response text
            reply = response.choices[0].message.content
            print("OpenAI response received, length:", len(reply))
            
            return jsonify({
                "reply": reply,
                "urgencyCheck": urgency_check
            })
            
        except Exception as e:
            print("Error from OpenAI API:", str(e))
            return jsonify({
                "error": "Error processing your message",
                "details": str(e)
            }), 500
            
    except Exception as e:
        print("Error in /api/chat endpoint:", str(e))
        return jsonify({
            "error": "Server error",
            "details": str(e)
        }), 500

# Serve static files
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Run the server
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))  # Default to 5001 to avoid AirPlay conflict
    app.run(host='0.0.0.0', port=port, debug=True)  # Enable debug mode for better error messages 
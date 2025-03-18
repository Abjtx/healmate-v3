// Configuration file for API keys
// DO NOT commit this file to version control with real API keys
// This is just a template - replace with your actual API key

const config = {
    // Replace this with your actual OpenAI API key
    OPENAI_API_KEY: "YOUR_OPENAI_API_KEY",
    
    // List of urgent symptoms that require immediate medical attention
    URGENT_SYMPTOMS: [
        "chest pain", "difficulty breathing", "shortness of breath", "severe bleeding",
        "sudden severe headache", "sudden numbness", "paralysis", "seizure", "unconscious",
        "unresponsive", "stroke", "heart attack", "severe abdominal pain", "coughing blood",
        "vomiting blood", "suicidal thoughts", "severe burn", "electric shock", "drowning",
        "deep wound", "head injury", "broken bone", "dislocated joint", "poisoning",
        "overdose", "anaphylaxis", "allergic reaction"
    ]
};

// For production, consider using environment variables or a more secure method
// Example: const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
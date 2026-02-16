import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
# Load environment variables
# Ensure we look for .env in the project root (2 levels up from this file)
current_dir = os.path.dirname(os.path.abspath(__file__)) # src/engine
src_dir = os.path.dirname(current_dir) # src
backend_dir = os.path.dirname(src_dir) # backend
env_path = os.path.join(backend_dir, ".env")

print(f"DEBUG: Looking for .env at: {env_path}")
print(f"DEBUG: File exists? {os.path.exists(env_path)}")

load_dotenv(env_path)

# Debug print to verify loading (DO NOT PRINT VALUE)
key = os.getenv("GEMINI_API_KEY")
print(f"DEBUG: GEMINI_API_KEY found? {'Yes' if key else 'No'}")
if key:
    print(f"DEBUG: Key starts with: {key[:5]}...")

class ShadowLithEngine:
    """
    ShadowLith Core Intelligence Engine.
    Handles persistent Gemini chat sessions with structured JSON output.
    """
    def __init__(self):
        # Initializing the modern GenAI Client
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
            
        self.client = genai.Client(api_key=api_key)
        self.model_id = "gemini-2.5-flash-lite"

        # Advanced Block-based Schema for Premium UI Formatting
        self.system_instruction = (
            "ROLE: You are ShadowLith, an elite technical analysis engine. Your goal is to provide 100% factual, high-density professional analysis.\n\n"
            "CORE OPERATIONAL RULES:\n"
            "1. ABSOLUTE JSON MODE: You MUST output ONLY valid JSON. NEVER include markdown formatting, triple backticks (```json), or conversational filler before/after the JSON object.\n"
            "2. GROUNDING & ACCURACY: If you are unsure of a technical detail, state 'Inconclusive' or 'Insufficient Data'. DO NOT hallucinate.\n"
            "3. ERROR CORRECTION: If the user provides a new capture containing an error message, stack trace, or buggy behavior related to your previous response, acknowledge the mistake (briefly in 'problem' block) and provide a corrected full solution. UNCONDITIONALLY update strategy, talk points, and code.\n"
            "4. SCHEMA ADHERENCE: Strictly follow this structure:\n"
            "   {\n"
            "     'summary': 'Precise title',\n"
            "     'time_complexity': 'O notation or null',\n"
            "     'space_complexity': 'O notation or null',\n"
            "     'blocks': [\n"
            "        {'type': 'text'|'code'|'warning'|'step'|'analysis'|'interview'|'problem'|'strategy'|'option', 'content': string, 'lang': string|null, 'label': string|null, 'time': string|null, 'space': string|null}\n"
            "     ]\n"
            "   }\n\n"
            "MODE SPECIFIC BEHAVIOR:\n"
            "- If MODE is 'Interview': Prioritize 'interview' and 'strategy' blocks. Provide conversational talking points that sound natural when spoken. Be detailed and pedagogical.\n"
            "- If MODE is 'Assessment': Be hyper-concise. Focus 100% on technical correctness and efficiency. Minimize conversational length in blocks.\n\n"
            "EXPLANATION STRATEGIES:\n"
            "- CODING: You MUST provide these blocks in order: 'problem' (analysis), 'strategy' (rationale), 'interview' (talking points), 'code' (full implementation), 'step' (logical breakdown steps), and 'analysis' (complexity details).\n"
            "- MCQ: You MUST provide: 'problem' (explanation of the logic) and 'option' (the correct choice with label like 'A' and content).\n"
            "- CHAT: Use the 'text' block for direct conversational interaction.\n\n"
            "TONE: Highly concise, objective, and technical. Prioritize speed and clarity."
        )

        # Create a stateful chat session with the system instruction
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                temperature=0.1,  # Lower temperature for more deterministic/stable JSON
                response_mime_type="application/json"  # Enforces JSON mode at the API level
            )
        )

    def reset(self):
        """Reset the chat session to clear history."""
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                temperature=0.1,
                response_mime_type="application/json"
            )
        )

    def ask(self, buffer_text: str) -> str:
        """
        Sends text to the persistent chat session and returns the JSON response.
        """
        try:
            # Send_message directly on the chat session
            response = self.chat.send_message(buffer_text)
            return response.text
        except Exception as e: 
            return f'{{"type": "error", "explanation": "API Error: {str(e)}"}}'

# if __name__ == "__main__":
#     # Quick test execution
#     engine = NyxEngine()
    
#     # Test Question
#     test_query = "MCQ: What is the capital of France? A) Berlin B) Paris C) Madrid"
#     print(engine.ask(test_query))
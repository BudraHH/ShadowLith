import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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
        self.model_id = "gemini-2.0-flash"

        # Industry standard: Define system instructions in the config
        system_instruction = (
            "You are ShadowLith, a stealth technical assistant.\n"
            "RULES:\n"
            "1. Output ONLY valid JSON. No markdown blocks, no triple backticks.\n"
            "2. Schema: {'type': 'mcq'|'code', 'option': str|null, 'code': str|null, 'explanation': str}\n"
            "3. If MCQ: provide 'option' and 'explanation'.\n"
            "4. If Coding: provide 'code' and 'explanation'.\n"
            "5. Be concise and precise."
        )

        # Create a stateful chat session with the system instruction
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,  # Lower temperature for more deterministic/stable JSON
                response_mime_type="application/json"  # Enforces JSON mode at the API level
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
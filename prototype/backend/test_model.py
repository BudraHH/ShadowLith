import os
from google import genai
from dotenv import load_dotenv

load_dotenv("d:\\projects\\StealthLith\\desktop-app\\backend\\.env")
key = os.getenv("GEMINI_API_KEY_1")
client = genai.Client(api_key=key)

model_id = "gemini-3-flash-preview"
print(f"Testing model: {model_id}")
try:
    response = client.models.generate_content(
        model=model_id,
        contents="hi"
    )
    print("Success!")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")

import os
import json
import logging

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv, find_dotenv
from openai import AsyncOpenAI

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Load environment variables
load_dotenv(find_dotenv())

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# System prompt for OpenAI API
FLASHCARDS_PROMPT = """
You are a text processor that converts text into revision style flashcards. 
Extract all information from the following text and return a JSON object.
Do not include information in the answer that is evident in the question. i.e. if the question is "What is the capital of France?", the answer should be "Paris" and not "The capital of France is Paris".
Example:
Text: The capital of France is Paris, which was founded in the 3rd century BC.
Return: 
{
    "flashcards": [
        {"question": "What is the capital of France?", "answer": "Paris"},
        {"question": "When was Paris founded?", "answer": "3rd century BC"}
    ]
}
Do not return:
"""

# Validate answer prompt
VALIDATE_ANSWER_PROMPT = """
You are a text processor that validates whether two answers are equivalent, and returns only 0 or 1.
Return 1 if the answers are informationally equivalent, and 0 if they are not.
"""

# Initialize OpenAI API client
client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Route to generate flashcards
@app.post("/generate_flashcards")
async def generate_flashcards(request: Request):
    try:
        # Parse the request body
        body = await request.json()
        text = body.get('text')

        if not text:
            raise HTTPException(status_code=400, detail="No text provided")
        
        # Call OpenAI API
        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": FLASHCARDS_PROMPT},
                {"role": "user", "content": text}
            ],
            model="gpt-4o-mini"
        )

        # Extract and parse the response
        response_text = response.choices[0].message.content
        response_json = json.loads(response_text)

        return response_json['flashcards']

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate flashcards")
    
# Route to validate answers
@app.post("/validate_answer")
async def validate_answer(request: Request):
    try:
        # Parse the request body
        body = await request.json()
        answer, user_answer = body.get('answer'), body.get('userAnswer')

        if not answer or not user_answer:
            raise HTTPException(status_code=400, detail="Invalid request body")

        # Check if the answer is correct
        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": VALIDATE_ANSWER_PROMPT},
                {"role": "user", "content": f"correct answer: {answer}\nuserAnswer: {user_answer}"}
            ],
            model="gpt-4o-mini"
        )
        is_correct = bool(int(response.choices[0].message.content.strip()))
        return {"isCorrect": is_correct}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to validate answer")

# Entry point for running the FastAPI app
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("SERVER_PORT", 8000)), log_level="debug")

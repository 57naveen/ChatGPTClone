# app/main.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import asyncio
from time import perf_counter

from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types

# ✅ Load environment variables
load_dotenv()

GOOGLE_API_KEY = ""

if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is not set in the environment!")

# ✅ Import the root agent
from app import root_agent

# --- Session Management ---
session_service = InMemorySessionService()

APP_NAME = "app"
USER_ID = "user_1"
SESSION_ID = "session_001"

async def ensure_session():
    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID,
    )
    print(f"Session created: App='{APP_NAME}', User='{USER_ID}', Session='{SESSION_ID}'")

# --- Runner ---
runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)
print(f"Runner created for agent '{runner.agent.name}'.")

# --- Call Agent ---
async def call_agent_async(query: str):
    print(f"\n>>> User Query: {query}")

    content = types.Content(
        role='user',
        parts=[types.Part(text=query)]
    )

    final_response_text = "Agent did not produce a final response."

    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=SESSION_ID,
        new_message=content
    ):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response_text = event.content.parts[0].text
                print(f"<<< Agent Response: {final_response_text}")
                return final_response_text
            elif event.actions and event.actions.escalate:
                final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                break

    print(f"<<< Agent Response: {final_response_text}")
    return final_response_text

# --- FastAPI App ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Allow frontend calls
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/gemini")
async def chat(request: Request):
    start_time = perf_counter()
    data = await request.json()
    user_message = data.get("message", "")

    if not user_message.strip():
        return JSONResponse({"response": "Please enter a message."}, status_code=400)

    try:
        await ensure_session()      

        # Optional timeout (e.g. 30s max)
        result = await asyncio.wait_for(
            call_agent_async(user_message),
            timeout=30
        )

        elapsed = perf_counter() - start_time
        print(f"Request took {elapsed:.2f}s")

        return JSONResponse({"response": result})

    except asyncio.TimeoutError:
        return JSONResponse(
            {"response": "The agent took too long to respond."},
            status_code=504,
        )
    except Exception as e:
        print(f"Error running agent: {e}")
        return JSONResponse(
            {"response": "An error occurred while processing your request."},
            status_code=500,
        )

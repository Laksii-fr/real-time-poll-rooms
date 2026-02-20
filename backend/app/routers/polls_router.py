from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from app.models.request_models import PollCreate, VoteCreate, GeneratePollRequest
import app.controllers.polls_controllers as polls_controller
from app.services.ai_poll_service import generate_poll_from_prompt

router = APIRouter()


@router.post("/polls/generate", response_model=None)
async def generate_poll(body: GeneratePollRequest):
    """Generate poll question and options from a text prompt using AI. Does not create a poll."""
    try:
        result = generate_poll_from_prompt(body.prompt)
        return {
            "status": "success",
            "message": "Poll generated successfully",
            "data": result,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/polls")
async def create_poll(poll: PollCreate):
    try:
        result = await polls_controller.create_poll(poll)
        return {
            "status": "success",
            "message": "Poll created successfully",
            "data": result
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#GET    /api/v1/polls/{poll_id}

@router.get("/polls/{poll_id}")
async def get_poll(poll_id: str):
    try:
        result = await polls_controller.get_poll(poll_id)
        return {
            "status": "success",
            "message": "Poll fetched successfully",
            "data": result
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/polls/{poll_id}/results")
async def get_poll_results(poll_id: str):
    try:
        result = await polls_controller.get_poll(poll_id)
        return {
            "status": "success",
            "message": "Poll results fetched successfully",
            "data": result
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
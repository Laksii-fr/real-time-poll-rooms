from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from app.models.request_models import PollCreate, VoteCreate
import app.controllers.polls_controllers as polls_controller

router = APIRouter()

@router.post("/polls")
async def create_poll(poll: PollCreate):
    try:
        result = await polls_controller.create_poll(poll)
        return {
            "status": "success",
            "message": "Poll created successfully",
            "data": result
        }
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#GET    /api/v1/polls/{poll_id}/results

@router.get("/polls/{poll_id}/results")
async def get_poll_results(poll_id: str):
    try:
        result = await polls_controller.get_poll(poll_id)
        return {
            "status": "success",
            "message": "Poll results fetched successfully",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
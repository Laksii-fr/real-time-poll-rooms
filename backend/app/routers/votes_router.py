from fastapi import APIRouter, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from app.models.request_models import VoteCreate
import app.controllers.votes_controllers as votes_controller
from app.utils.websocket_manager import manager

router = APIRouter()

@router.post("/polls/{poll_id}/votes")
async def vote(poll_id: str, vote: VoteCreate, request: Request, response: Response):
    try:
        result = await votes_controller.vote(poll_id, vote, request)
        
        if result.get("voter_token"):
            response.set_cookie(
                key="voter_token", 
                value=result["voter_token"], 
                httponly=True, 
                max_age=31536000
            )
        # Broadcast the update to all connected clients
        broadcast_msg = jsonable_encoder({
            "status": "update",
            "data": result["poll"]
        })
        await manager.broadcast(poll_id, broadcast_msg)

        return {
            "status": "success",
            "message": "Vote cast successfully",
            "data": result["poll"]
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#WS     /api/v1/ws/polls/{poll_id}
@router.websocket("/ws/polls/{poll_id}")
async def websocket_endpoint(websocket: WebSocket, poll_id: str):
    await manager.connect(poll_id, websocket)

    try:
        while True:
            await websocket.receive_text()  # or keep alive
    except WebSocketDisconnect:
        manager.disconnect(poll_id, websocket)

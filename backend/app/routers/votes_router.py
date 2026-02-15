from fastapi import APIRouter, HTTPException, Request, Response
from app.models.request_models import VoteCreate
import app.controllers.votes_controllers as votes_controller
import app.utils.websocket_manager as manager

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
async def websocket_endpoint(websocket, poll_id):
    await manager.connect(poll_id, websocket)

    try:
        while True:
            await websocket.receive_text()  # or keep alive
    except WebSocketDisconnect:
        manager.disconnect(poll_id, websocket)

import uuid
from fastapi import HTTPException, status, Request
from app.models.request_models import VoteCreate
from app.models.response_models import PollResponse
from app.models.db_models import Vote, Option, Poll
from app.database import async_session_maker
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from datetime import datetime

async def vote(poll_id: str, vote_data: VoteCreate, request: Request):

    ip_address = request.client.host if request.client else "unknown"
    voter_token = request.cookies.get("voter_token")
    new_token_generated = False
    if not voter_token:
        voter_token = str(uuid.uuid4())
        new_token_generated = True

    try:
        async with async_session_maker() as session:
            async with session.begin():
                # Optimize: Validate Option and Poll in one go
                # If the option exists and is linked to the poll_id, both match.
                result = await session.execute(
                    select(Option)
                    .where(Option.id == vote_data.option_id)
                    .where(Option.poll_id == poll_id)
                )
                option = result.scalar_one_or_none()
                
                if not option:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND, 
                        detail="Option not found or does not belong to this poll"
                    )
                
                # Insert new Vote
                new_vote = Vote(
                    poll_id=poll_id,
                    option_id=vote_data.option_id,
                    voter_token=voter_token,
                    ip_address=ip_address,
                    created_at=datetime.utcnow()
                )
                session.add(new_vote)
                
                option.vote_count += 1

            result = await session.execute(select(Poll).where(Poll.id == poll_id).options(selectinload(Poll.options)))
            poll_obj = result.scalar_one()
            
            return {
                "poll": PollResponse.from_orm(poll_obj),
                "voter_token": voter_token if new_token_generated else None
            }

    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already voted."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"500: {str(e)}"
        )

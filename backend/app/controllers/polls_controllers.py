import app.models.db_models as Models
from app.models.request_models import PollCreate
from app.database import async_session_maker
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from fastapi import HTTPException, status

async def create_poll(poll_data: PollCreate):
    try:
        async with async_session_maker() as session:
            async with session.begin():
                # Create the poll
                new_poll = Models.Poll(
                    question=poll_data.question,
                    created_at=datetime.utcnow()
                )
                session.add(new_poll)
                await session.flush()

                # Create options from input data
                for option_text in poll_data.options:
                    new_option = Models.Option(
                        poll_id=new_poll.id,
                        text=option_text,
                        created_at=datetime.utcnow()
                    )
                    session.add(new_option)
                
                await session.commit()

            # Reload the poll with options asynchronously before returning
            result = await session.execute(
                select(Models.Poll)
                .where(Models.Poll.id == new_poll.id)
                .options(selectinload(Models.Poll.options))
            )
            poll_obj = result.scalar_one()
            return poll_obj
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"500: {str(e)}"
        )

async def get_poll(poll_id: str):
    try:
        async with async_session_maker() as session:
            result = await session.execute(
                select(Models.Poll)
                .where(Models.Poll.id == poll_id)
                .options(selectinload(Models.Poll.options))
            )
            poll_obj = result.scalar_one_or_none()
            if not poll_obj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail="Poll not found"
                )
            return poll_obj
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"500: {str(e)}"
        )
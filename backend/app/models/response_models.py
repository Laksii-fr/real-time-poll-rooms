from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class OptionResponse(BaseModel):
    id: UUID
    poll_id: UUID
    text: str
    vote_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class PollResponse(BaseModel):
    id: UUID
    question: str
    created_at: datetime
    options: List[OptionResponse] = []

    class Config:
        from_attributes = True
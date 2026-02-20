from pydantic import BaseModel, Field, validator
from typing import List
from uuid import UUID

class PollCreate(BaseModel):
    question: str = Field(..., min_length=5, max_length=500)
    options: List[str] = Field(..., min_items=2)


class GeneratePollRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=1000)


class GeneratedPollResponse(BaseModel):
    question: str
    options: List[str]

    @validator("options")
    def validate_options(cls, value):
        cleaned = [opt.strip() for opt in value if opt.strip()]
        if len(cleaned) < 2:
            raise ValueError("At least two non-empty options are required.")
        return cleaned

from datetime import datetime

class VoteCreate(BaseModel):
    option_id: UUID

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
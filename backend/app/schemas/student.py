
from pydantic import BaseModel, ConfigDict

class StudentCreate(BaseModel):
    age: int
    registration_number: str
    native_place: str
    progress: str | None = None

class StudentResponse(BaseModel):
    id: int
    user_id: int
    name: str
    age: int
    registration_number: str
    native_place: str
    progress: str | None
    profile_image: str | None = None
    model_config = ConfigDict(from_attributes=True)

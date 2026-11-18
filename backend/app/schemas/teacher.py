
from pydantic import BaseModel, ConfigDict

class TeacherCreate(BaseModel):
    subject: str
    experience: int
    qualification: str
    about: str | None = None

class TeacherResponse(BaseModel):
    id: int
    user_id: int
    name: str
    subject: str
    experience: int
    qualification: str
    about: str | None
    profile_image: str | None = None
    model_config = ConfigDict(from_attributes=True)

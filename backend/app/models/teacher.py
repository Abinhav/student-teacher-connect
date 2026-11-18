from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    subject = Column(String(100), nullable=False)
    experience = Column(Integer, nullable=False)
    qualification = Column(String(150), nullable=False)
    about = Column(String(500), nullable=True)
    profile_image = Column(String(255), nullable=True)
    user = relationship("User", back_populates="teacher_profile")

    @property
    def name(self):
        return self.user.name
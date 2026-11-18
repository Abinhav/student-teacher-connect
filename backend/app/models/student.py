
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=False)
    registration_number = Column(String(50), unique=True, nullable=False)
    native_place = Column(String(100), nullable=False)
    progress = Column(String(500), nullable=True)
    profile_image = Column(String(255), nullable=True)
    @property
    def name(self):
      return self.user.name
    user = relationship("User", back_populates="student_profile")

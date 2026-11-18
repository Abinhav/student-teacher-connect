
from app.database import Base, engine
from app.models.user import User
from app.models.student import Student
from app.models.teacher import Teacher

Base.metadata.create_all(bind=engine)

print("All models imported successfully")
print("User, Student and Teacher relationships are ready")

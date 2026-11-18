from app.database import SessionLocal
from app.models.student import Student

db = SessionLocal()

student = Student(
    name="Arun",
    age=21,
    email="arun@gmail.com"
)

db.add(student)
db.commit()
db.refresh(student)

print("Student inserted successfully")
print("Student ID:", student.id)

db.close()
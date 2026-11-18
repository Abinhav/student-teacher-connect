from app.database import SessionLocal
from app.models.student import Student

db = SessionLocal()

students = db.query(Student).all()

for student in students:
    print("ID:", student.id)
    print("Name:", student.name)
    print("Age:", student.age)
    print("Email:", student.email)
    print("------------------")

db.close()
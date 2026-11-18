from app.database import SessionLocal
from app.models.student import Student

db = SessionLocal()

student_id = 1

student = db.query(Student).filter(Student.id == student_id).first()

if student:
    print("Student Found")
    print("ID:", student.id)
    print("Name:", student.name)
    print("Age:", student.age)
    print("Email:", student.email)
else:
    print("Student Not Found")

db.close()
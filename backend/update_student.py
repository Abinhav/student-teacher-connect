from app.database import SessionLocal
from app.models.student import Student

db = SessionLocal()

student = db.query(Student).filter(Student.id == 1).first()

if student:
    student.name = "Arun Kumar"
    student.age = 22

    db.commit()
    db.refresh(student)

    print("Student updated successfully")
    print("Name:", student.name)
    print("Age:", student.age)
else:
    print("Student not found")

db.close()
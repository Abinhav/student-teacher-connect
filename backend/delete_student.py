from app.database import SessionLocal
from app.models.student import Student

db = SessionLocal()

student = db.query(Student).filter(Student.id == 1).first()

if student:
    db.delete(student)
    db.commit()

    print("Student deleted successfully")
else:
    print("Student not found")

db.close()
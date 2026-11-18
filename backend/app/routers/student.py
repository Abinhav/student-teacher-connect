
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
import os
import shutil
from uuid import uuid4

from app.database import get_db
from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentCreate, StudentResponse
from app.utils.authorization import require_role

UPLOAD_DIR = "uploads/students"

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()


@router.post("/profile", response_model=StudentResponse, status_code=201)
def create_student_profile(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    existing_profile = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Student profile already exists"
        )

    new_student = Student(
        user_id=current_user.id,
        age=student_data.age,
        registration_number=student_data.registration_number,
        native_place=student_data.native_place,
        progress=student_data.progress
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


@router.get("/search", response_model=list[StudentResponse])
def search_students(
    native_place: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    students = db.query(Student).filter(
        Student.native_place.ilike(f"%{native_place}%")
    ).all()

    return students


@router.get("/", response_model=list[StudentResponse])
def get_all_students(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    students = db.query(Student).offset(skip).limit(limit).all()

    return students


@router.get("/profile-status")
def get_student_profile_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if student is None:
        return {
            "profile_completed": False,
            "message": "Please complete your student profile"
        }

    return {
        "profile_completed": True,
        "message": "Student profile completed"
    }


@router.get("/my-profile", response_model=StudentResponse)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    return student


@router.put("/my-profile", response_model=StudentResponse)
def update_my_student_profile(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    student.age = student_data.age
    student.registration_number = student_data.registration_number
    student.native_place = student_data.native_place
    student.progress = student_data.progress

    db.commit()
    db.refresh(student)

    return student


@router.post("/upload-image")
def upload_student_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    extension = os.path.splitext(file.filename or "")[1].lower()

    if extension not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPG and PNG allowed"
        )

    filename = f"{uuid4()}{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    student.profile_image = f"/uploads/students/{filename}"

    db.commit()
    db.refresh(student)

    return {
        "message": "Profile image uploaded successfully",
        "profile_image": student.profile_image
    }


@router.get("/{student_id}", response_model=StudentResponse)
def get_student_profile(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student

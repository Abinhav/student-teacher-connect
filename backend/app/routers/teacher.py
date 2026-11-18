
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
import os
import shutil
from uuid import uuid4

from app.database import get_db
from app.models.teacher import Teacher
from app.models.user import User
from app.schemas.teacher import TeacherCreate, TeacherResponse
from app.utils.authorization import require_role
from app.utils.authentication import get_current_user

UPLOAD_DIR = "uploads/teachers"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()


@router.post("/profile", response_model=TeacherResponse, status_code=201)
def create_teacher_profile(
    teacher_data: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    existing_profile = db.query(Teacher).filter(
        Teacher.user_id == current_user.id
    ).first()

    if existing_profile:
        raise HTTPException(status_code=400, detail="Teacher profile already exists")

    new_teacher = Teacher(
        user_id=current_user.id,
        subject=teacher_data.subject,
        experience=teacher_data.experience,
        qualification=teacher_data.qualification,
        about=teacher_data.about
    )

    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)

    return new_teacher


@router.get("/search", response_model=list[TeacherResponse])
def search_teachers(
    subject: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    teachers = db.query(Teacher).filter(
        Teacher.subject.ilike(f"%{subject}%")
    ).all()

    return teachers


@router.get("/", response_model=list[TeacherResponse])
def get_all_teachers(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    teachers = db.query(Teacher).offset(skip).limit(limit).all()

    return teachers


@router.get("/profile-status")
def get_teacher_profile_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    teacher = db.query(Teacher).filter(
        Teacher.user_id == current_user.id
    ).first()

    if teacher is None:
        return {
            "profile_completed": False,
            "message": "Please complete your teacher profile"
        }

    return {
        "profile_completed": True,
        "message": "Teacher profile completed"
    }


@router.get("/my-profile", response_model=TeacherResponse)
def get_my_teacher_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    teacher = db.query(Teacher).filter(
        Teacher.user_id == current_user.id
    ).first()

    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    return teacher


@router.put("/my-profile", response_model=TeacherResponse)
def update_my_teacher_profile(
    teacher_data: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    teacher = db.query(Teacher).filter(
        Teacher.user_id == current_user.id
    ).first()

    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    teacher.subject = teacher_data.subject
    teacher.experience = teacher_data.experience
    teacher.qualification = teacher_data.qualification
    teacher.about = teacher_data.about

    db.commit()
    db.refresh(teacher)

    return teacher


@router.post("/upload-image")
def upload_teacher_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    teacher = db.query(Teacher).filter(
        Teacher.user_id == current_user.id
    ).first()

    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    extension = os.path.splitext(file.filename or "")[1].lower()

    if extension not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(status_code=400, detail="Only JPG and PNG allowed")

    filename = f"{uuid4()}{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    teacher.profile_image = f"/uploads/teachers/{filename}"

    db.commit()
    db.refresh(teacher)

    return {
        "message": "Profile image uploaded successfully",
        "profile_image": teacher.profile_image
    }


@router.get("/{teacher_id}", response_model=TeacherResponse)
def get_teacher_profile(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    teacher = db.query(Teacher).filter(
        Teacher.id == teacher_id
    ).first()

    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    return teacher

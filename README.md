# Student Teacher Connect

A full-stack web application that connects students and teachers through a simple and user-friendly platform.

## About the Project

Student Teacher Connect is designed to make communication between students and teachers easier. Students can create profiles, update their academic progress, and explore teacher profiles. Teachers can manage their profiles, view student information, and search for students based on their native place.

## Features

### Authentication
- Student and teacher registration
- Secure login with password hashing
- JWT-based authentication
- Role-based access control

### Student Features
- Create and update student profiles
- Add age, registration number, native place, and progress
- Upload profile images
- View teacher profiles
- Search for teachers

### Teacher Features
- Create and update teacher profiles
- Add subject, experience, qualification, and about information
- Upload profile images
- View student profiles
- Search students by native place
- Explore other teacher profiles

## Technologies Used

| Category | Technology |
|---|---|
| Backend | Python, FastAPI |
| Frontend | HTML, CSS, JavaScript |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT |
| Password Security | Argon2 |
| API Documentation | Swagger UI |
| Version Control | Git and GitHub |

## Project Structure

```text
student-teacher-connect/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── uploads/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── script.js
│   │   ├── student-dashboard.js
│   │   └── teacher-dashboard.js
│   ├── assets/
│   ├── index.html
│   ├── student-dashboard.html
│   └── teacher-dashboard.html
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Abinhav/student-teacher-connect.git
cd student-teacher-connect
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend` folder.

Add your PostgreSQL database connection and a secure secret key:

```env
DATABASE_URL=postgresql+psycopg://your_username:your_password@localhost:5432/your_database_name
SECRET_KEY=your_secure_secret_key
```

Replace the placeholders with your own PostgreSQL credentials and database name.

### 5. Run the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

### 6. Open API Documentation

Visit:

```text
http://127.0.0.1:8000/docs
```

### 7. Run the Frontend

Open another terminal:

```bash
cd frontend
python -m http.server 5500
```

Open the application:

```text
http://localhost:5500
```

## API Documentation

FastAPI provides interactive API documentation through Swagger UI.

Available API groups include:

- Authentication: `/auth`
- Student operations: `/students`
- Teacher operations: `/teachers`

Open `/docs` to explore and test the available endpoints.

## Security

- Passwords are hashed before storage.
- JWT tokens are used for authentication.
- Role-based authorization protects restricted endpoints.
- Environment variables are used for sensitive configuration.
- `.env` and uploaded files are excluded from Git tracking.

## Future Enhancements

- Student progress timeline
- Advanced search and filtering
- Profile completion indicator
- Notifications
- Password reset functionality
- Pagination for student and teacher listings

## Author

**Abinhav**

GitHub: [Abinhav](https://github.com/Abinhav)

## License

This project is developed for educational and portfolio purposes.
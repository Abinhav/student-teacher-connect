
const API_URL = "http://127.0.0.1:8000";

let currentTeacherId = null;
let activeStudentModalId = null;

const updateTeacherForm = document.getElementById("updateTeacherForm");
const uploadTeacherImageForm = document.getElementById("uploadTeacherImageForm");
const teacherUpdateSection = document.getElementById("teacherUpdateSection");

function toggleTeacherUpdateForm() {
    const isHidden = teacherUpdateSection.style.display === "none";

    teacherUpdateSection.style.display = isHidden ? "block" : "none";

    document.getElementById("updateTeacherMessage").textContent = "";
    document.getElementById("teacherImageUploadMessage").textContent = "";
}

async function loadTeacherDashboard() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const authResponse = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!authResponse.ok) {
            logout();
            return;
        }

        const user = await authResponse.json();

        if (user.role !== "teacher") {
            window.location.href = "student-dashboard.html";
            return;
        }

        const response = await fetch(`${API_URL}/teachers/my-profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            document.getElementById("teacherName").textContent =
                "Teacher profile not found";
            return;
        }

        const teacher = await response.json();

        currentTeacherId = teacher.id;

        document.getElementById("teacherName").textContent = teacher.name;
        document.getElementById("teacherSubject").textContent = teacher.subject;
        document.getElementById("teacherExperience").textContent = teacher.experience;
        document.getElementById("teacherQualification").textContent =
            teacher.qualification;
        document.getElementById("teacherAbout").textContent =
            teacher.about || "Not provided";

        const imageUrl = teacher.profile_image
            ? `${API_URL}${teacher.profile_image}?t=${Date.now()}`
            : "assets/default-profile.png";

        document.getElementById("teacherImage").src = imageUrl;
        document.getElementById("teacherImagePreview").src = imageUrl;

        document.getElementById("editSubject").value = teacher.subject;
        document.getElementById("editExperience").value = teacher.experience;
        document.getElementById("editQualification").value =
            teacher.qualification;
        document.getElementById("editAbout").value = teacher.about || "";

        await loadAllStudents(token);
        await loadAllOtherTeachers(token);

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

updateTeacherForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");
    const message = document.getElementById("updateTeacherMessage");

    const teacherData = {
        subject: document.getElementById("editSubject").value.trim(),
        experience: Number(document.getElementById("editExperience").value),
        qualification: document.getElementById("editQualification").value.trim(),
        about: document.getElementById("editAbout").value.trim() || null
    };

    try {
        message.textContent = "Updating profile...";

        const response = await fetch(`${API_URL}/teachers/my-profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(teacherData)
        });

        const result = await response.json();

        if (response.ok) {
            await loadTeacherDashboard();

            message.textContent = "Profile updated successfully!";
            teacherUpdateSection.style.display = "none";

        } else {
            message.textContent =
                result.detail || "Profile update failed";
        }

    } catch (error) {
        message.textContent = "Server error";
    }
});

uploadTeacherImageForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");
    const fileInput = document.getElementById("teacherImageFile");
    const message = document.getElementById("teacherImageUploadMessage");

    if (!fileInput.files.length) {
        message.textContent = "Please select an image";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        message.textContent = "Uploading image...";

        const response = await fetch(`${API_URL}/teachers/upload-image`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            message.textContent =
                result.detail || "Image upload failed";
            return;
        }

        const imageUrl = `${API_URL}${result.profile_image}?t=${Date.now()}`;

        document.getElementById("teacherImage").src = imageUrl;
        document.getElementById("teacherImagePreview").src = imageUrl;

        message.textContent = "Profile picture updated successfully!";

        uploadTeacherImageForm.reset();

    } catch (error) {
        message.textContent = "Server error";
    }
});

async function loadAllStudents(token) {
    try {
        const response = await fetch(`${API_URL}/students/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            document.getElementById("studentsList").textContent =
                "Unable to load students";
            return;
        }

        const students = await response.json();
        displayStudents(students, token);

    } catch (error) {
        document.getElementById("studentsList").textContent =
            "Server error";
    }
}

async function searchStudents() {
    const token = localStorage.getItem("access_token");
    const place = document.getElementById("searchPlace").value.trim();
    const message = document.getElementById("searchMessage");

    if (!place) {
        message.textContent = "Please enter a native place";
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/students/search?native_place=${encodeURIComponent(place)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            message.textContent = "Student search failed";
            return;
        }

        const students = await response.json();

        message.textContent = students.length
            ? `${students.length} student(s) found`
            : "No students found";

        displayStudents(students, token);

    } catch (error) {
        message.textContent = "Server error";
    }
}

async function resetStudentSearch() {
    document.getElementById("searchPlace").value = "";
    document.getElementById("searchMessage").textContent = "";

    const token = localStorage.getItem("access_token");
    await loadAllStudents(token);
}

function displayStudents(students, token) {
    const container = document.getElementById("studentsList");

    container.innerHTML = "";

    if (!students.length) {
        container.textContent = "No students available";
        return;
    }

    students.forEach(student => {
        const card = document.createElement("div");
        card.className = "auth-box";

        const image = document.createElement("img");
        image.src = student.profile_image
            ? `${API_URL}${student.profile_image}`
            : "assets/default-profile.png";
        image.alt = "Student Profile";
        image.width = 80;

        const name = document.createElement("h3");
        name.textContent = student.name;

        const registration = document.createElement("p");
        registration.textContent =
            `Registration Number: ${student.registration_number}`;

        const place = document.createElement("p");
        place.textContent = `Native Place: ${student.native_place}`;

        const age = document.createElement("p");
        age.textContent = `Age: ${student.age}`;

        const button = document.createElement("button");
        button.textContent = "View Details";
        button.onclick = () => viewStudentDetails(student.id, token);

        card.append(image, name, registration, place, age, button);
        container.appendChild(card);
    });
}

function closeStudentModal() {
    const modal = document.getElementById("studentModalOverlay");

    if (modal) {
        modal.remove();
    }

    activeStudentModalId = null;
}

async function viewStudentDetails(studentId, token) {
    if (activeStudentModalId === studentId) {
        closeStudentModal();
        return;
    }

    closeStudentModal();

    try {
        const response = await fetch(`${API_URL}/students/${studentId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            alert("Unable to load student details");
            return;
        }

        const student = await response.json();

        const overlay = document.createElement("div");
        overlay.id = "studentModalOverlay";
        overlay.className = "student-modal-overlay";

        overlay.onclick = function(event) {
            if (event.target === overlay) {
                closeStudentModal();
            }
        };

        const modal = document.createElement("div");
        modal.className = "student-modal";

        modal.onclick = function(event) {
            event.stopPropagation();
        };

        const closeIcon = document.createElement("button");
        closeIcon.className = "student-modal-close";
        closeIcon.textContent = "×";
        closeIcon.onclick = closeStudentModal;

        const image = document.createElement("img");
        image.src = student.profile_image
            ? `${API_URL}${student.profile_image}`
            : "assets/default-profile.png";
        image.alt = "Student Profile";

        const name = document.createElement("h2");
        name.textContent = student.name;

        const age = document.createElement("p");
        age.textContent = `Age: ${student.age}`;

        const registration = document.createElement("p");
        registration.textContent =
            `Registration Number: ${student.registration_number}`;

        const place = document.createElement("p");
        place.textContent = `Native Place: ${student.native_place}`;

        const progress = document.createElement("p");
        progress.textContent =
            `Progress: ${student.progress || "Not provided"}`;

        const closeButton = document.createElement("button");
        closeButton.className = "modal-close-button";
        closeButton.textContent = "Close Profile";
        closeButton.onclick = closeStudentModal;

        modal.append(
            closeIcon,
            image,
            name,
            age,
            registration,
            place,
            progress,
            closeButton
        );

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        activeStudentModalId = studentId;

    } catch (error) {
        alert("Server error");
    }
}

async function loadAllOtherTeachers(token) {
    const container = document.getElementById("otherTeachersList");

    try {
        const response = await fetch(`${API_URL}/teachers/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            container.textContent = "Unable to load teachers";
            return;
        }

        const teachers = await response.json();

        const otherTeachers = teachers.filter(
            teacher => teacher.id !== currentTeacherId
        );

        displayOtherTeachers(otherTeachers, token);

    } catch (error) {
        container.textContent = "Server error";
    }
}

async function searchOtherTeachers() {
    const token = localStorage.getItem("access_token");
    const subject = document.getElementById("searchTeacherSubject").value.trim();
    const message = document.getElementById("otherTeacherSearchMessage");

    if (!subject) {
        message.textContent = "Please enter a subject";
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/teachers/search?subject=${encodeURIComponent(subject)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            message.textContent = "Teacher search failed";
            return;
        }

        const teachers = await response.json();

        const otherTeachers = teachers.filter(
            teacher => teacher.id !== currentTeacherId
        );

        message.textContent = otherTeachers.length
            ? `${otherTeachers.length} teacher(s) found`
            : "No other teachers found";

        displayOtherTeachers(otherTeachers, token);

    } catch (error) {
        message.textContent = "Server error";
    }
}

async function resetOtherTeacherSearch() {
    document.getElementById("searchTeacherSubject").value = "";
    document.getElementById("otherTeacherSearchMessage").textContent = "";

    const token = localStorage.getItem("access_token");
    await loadAllOtherTeachers(token);
}

function displayOtherTeachers(teachers, token) {
    const container = document.getElementById("otherTeachersList");

    container.innerHTML = "";

    if (!teachers.length) {
        container.textContent = "No other teachers available";
        return;
    }

    teachers.forEach(teacher => {
        const card = document.createElement("div");
        card.className = "auth-box";

        const image = document.createElement("img");
        image.src = teacher.profile_image
            ? `${API_URL}${teacher.profile_image}`
            : "assets/default-profile.png";
        image.alt = "Teacher Profile";
        image.width = 80;

        const name = document.createElement("h3");
        name.textContent = teacher.name;

        const subject = document.createElement("p");
        subject.textContent = `Subject: ${teacher.subject}`;

        const experience = document.createElement("p");
        experience.textContent = `Experience: ${teacher.experience} years`;

        const qualification = document.createElement("p");
        qualification.textContent =
            `Qualification: ${teacher.qualification}`;

        const button = document.createElement("button");
        button.textContent = "View Profile";
        button.onclick = () => viewOtherTeacherProfile(teacher.id, token);

        card.append(
            image,
            name,
            subject,
            experience,
            qualification,
            button
        );

        container.appendChild(card);
    });
}

async function viewOtherTeacherProfile(teacherId, token) {
    const container = document.getElementById("otherTeacherDetailsContainer");

    try {
        const response = await fetch(`${API_URL}/teachers/${teacherId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            container.textContent = "Unable to load teacher profile";
            return;
        }

        const teacher = await response.json();

        container.innerHTML = "";

        const details = document.createElement("div");
        details.className = "auth-box";

        const image = document.createElement("img");
        image.src = teacher.profile_image
            ? `${API_URL}${teacher.profile_image}`
            : "assets/default-profile.png";
        image.alt = "Teacher Profile";
        image.width = 120;

        const name = document.createElement("h2");
        name.textContent = teacher.name;

        const subject = document.createElement("p");
        subject.textContent = `Subject: ${teacher.subject}`;

        const experience = document.createElement("p");
        experience.textContent = `Experience: ${teacher.experience} years`;

        const qualification = document.createElement("p");
        qualification.textContent =
            `Qualification: ${teacher.qualification}`;

        const about = document.createElement("p");
        about.textContent = `About: ${teacher.about || "Not provided"}`;

        const closeButton = document.createElement("button");
        closeButton.textContent = "Close Profile";
        closeButton.onclick = () => {
            container.innerHTML = "";
        };

        details.append(
            image,
            name,
            subject,
            experience,
            qualification,
            about,
            closeButton
        );

        container.appendChild(details);

    } catch (error) {
        container.textContent = "Server error";
    }
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeStudentModal();
    }
});

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");

    window.location.href = "index.html";
}

loadTeacherDashboard();


const API_URL = "http://127.0.0.1:8000";

const updateProfileForm = document.getElementById("updateProfileForm");
const uploadImageForm = document.getElementById("uploadImageForm");
const updateProfileSection = document.getElementById("updateProfileSection");

function toggleUpdateProfileForm() {
    const isHidden = updateProfileSection.style.display === "none";

    updateProfileSection.style.display = isHidden ? "block" : "none";

    document.getElementById("updateMessage").textContent = "";
    document.getElementById("imageUploadMessage").textContent = "";
}

uploadImageForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");
    const imageFile = document.getElementById("profileImageFile").files[0];
    const message = document.getElementById("imageUploadMessage");

    if (!imageFile) {
        message.textContent = "Please select an image";
        return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
        message.textContent = "Uploading image...";

        const response = await fetch(`${API_URL}/students/upload-image`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Image upload failed");
        }

        const imageUrl = `${API_URL}${result.profile_image}?t=${Date.now()}`;

        document.getElementById("studentImage").src = imageUrl;
        document.getElementById("studentImagePreview").src = imageUrl;

        message.textContent = "Profile picture updated successfully!";

        uploadImageForm.reset();

    } catch (error) {
        message.textContent = error.message;
    }
});

updateProfileForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");
    const message = document.getElementById("updateMessage");

    const updatedData = {
        age: Number(document.getElementById("editAge").value),
        registration_number: document.getElementById("editReg").value.trim(),
        native_place: document.getElementById("editPlace").value.trim(),
        progress: document.getElementById("editProgress").value.trim() || null
    };

    try {
        message.textContent = "Updating profile...";

        const response = await fetch(`${API_URL}/students/my-profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Profile update failed");
        }

        message.textContent = "Profile updated successfully!";

        await loadStudentDashboard();

        updateProfileSection.style.display = "none";

    } catch (error) {
        message.textContent = error.message;
    }
});

async function loadStudentDashboard() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const userResponse = await fetch(`${API_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error("Authentication failed");
        }

        const user = await userResponse.json();

        if (user.role !== "student") {
            window.location.href = "index.html";
            return;
        }

        const profileResponse = await fetch(`${API_URL}/students/my-profile`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!profileResponse.ok) {
            throw new Error("Student profile not found");
        }

        const student = await profileResponse.json();

        document.getElementById("studentName").textContent = student.name;
        document.getElementById("studentAge").textContent = student.age;
        document.getElementById("studentReg").textContent =
            student.registration_number;
        document.getElementById("studentPlace").textContent =
            student.native_place;
        document.getElementById("studentProgress").textContent =
            student.progress || "Not updated";

        document.getElementById("editAge").value = student.age;
        document.getElementById("editReg").value =
            student.registration_number;
        document.getElementById("editPlace").value =
            student.native_place;
        document.getElementById("editProgress").value =
            student.progress || "";

        const imageUrl = student.profile_image
            ? `${API_URL}${student.profile_image}?t=${Date.now()}`
            : "assets/default-profile.png";

        document.getElementById("studentImage").src = imageUrl;
        document.getElementById("studentImagePreview").src = imageUrl;

    } catch (error) {
        alert(error.message);

        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");

        window.location.href = "index.html";
    }
}

async function searchTeachers() {
    const token = localStorage.getItem("access_token");
    const subject = document.getElementById("searchSubject").value.trim();
    const message = document.getElementById("teacherSearchMessage");

    if (!subject) {
        message.textContent = "Please enter a subject";
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/teachers/search?subject=${encodeURIComponent(subject)}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const teachers = await response.json();

        if (!response.ok) {
            throw new Error(teachers.detail || "Teacher search failed");
        }

        displayTeachers(teachers);

        message.textContent = `${teachers.length} teacher(s) found`;

    } catch (error) {
        message.textContent = error.message;
    }
}

async function resetTeacherSearch() {
    document.getElementById("searchSubject").value = "";
    document.getElementById("teacherSearchMessage").textContent = "";

    await loadAllTeachers();
}

async function loadAllTeachers() {
    const token = localStorage.getItem("access_token");
    const teachersList = document.getElementById("teachersList");

    try {
        const response = await fetch(`${API_URL}/teachers/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const teachers = await response.json();

        if (!response.ok) {
            throw new Error(teachers.detail || "Unable to load teachers");
        }

        displayTeachers(teachers);

    } catch (error) {
        teachersList.textContent = error.message;
    }
}

function displayTeachers(teachers) {
    const teachersList = document.getElementById("teachersList");

    teachersList.innerHTML = "";

    if (teachers.length === 0) {
        teachersList.textContent = "No teachers found";
        return;
    }

    teachers.forEach(function(teacher) {
        const teacherCard = document.createElement("div");
        teacherCard.className = "auth-box";

        const name = document.createElement("h3");
        name.textContent = teacher.name;

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + teacher.subject;

        const experience = document.createElement("p");
        experience.textContent =
            "Experience: " + teacher.experience + " years";

        const qualification = document.createElement("p");
        qualification.textContent =
            "Qualification: " + teacher.qualification;

        const image = document.createElement("img");
        image.alt = "Teacher Profile";
        image.width = 100;

        if (teacher.profile_image) {
            image.src = `${API_URL}${teacher.profile_image}`;
        } else {
            image.style.display = "none";
        }

        const viewButton = document.createElement("button");
        viewButton.textContent = "View Profile";

        viewButton.addEventListener("click", function() {
            viewTeacherProfile(teacher.id);
        });

        teacherCard.appendChild(image);
        teacherCard.appendChild(name);
        teacherCard.appendChild(subject);
        teacherCard.appendChild(experience);
        teacherCard.appendChild(qualification);
        teacherCard.appendChild(viewButton);

        teachersList.appendChild(teacherCard);
    });
}

async function viewTeacherProfile(teacherId) {
    const token = localStorage.getItem("access_token");

    try {
        const response = await fetch(`${API_URL}/teachers/${teacherId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const teacher = await response.json();

        if (!response.ok) {
            throw new Error(
                teacher.detail || "Unable to load teacher profile"
            );
        }

        const container = document.getElementById("teacherDetailsContainer");
        container.innerHTML = "";

        const modal = document.createElement("div");

        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.background = "rgba(0, 0, 0, 0.6)";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.zIndex = "1000";
        modal.style.padding = "20px";

        const detailsBox = document.createElement("div");

        detailsBox.style.background = "white";
        detailsBox.style.padding = "30px";
        detailsBox.style.borderRadius = "12px";
        detailsBox.style.width = "420px";
        detailsBox.style.maxWidth = "100%";
        detailsBox.style.maxHeight = "85vh";
        detailsBox.style.overflowY = "auto";

        const heading = document.createElement("h2");
        heading.textContent = "Teacher Profile";

        const image = document.createElement("img");
        image.alt = "Teacher Profile";
        image.width = 120;

        if (teacher.profile_image) {
            image.src = `${API_URL}${teacher.profile_image}`;
        } else {
            image.style.display = "none";
        }

        const name = document.createElement("p");
        name.textContent = "Name: " + teacher.name;

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + teacher.subject;

        const experience = document.createElement("p");
        experience.textContent =
            "Experience: " + teacher.experience + " years";

        const qualification = document.createElement("p");
        qualification.textContent =
            "Qualification: " + teacher.qualification;

        const about = document.createElement("p");
        about.textContent = "About: " + (teacher.about || "Not updated");

        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";

        closeButton.addEventListener("click", function() {
            modal.remove();
        });

        detailsBox.appendChild(heading);
        detailsBox.appendChild(image);
        detailsBox.appendChild(name);
        detailsBox.appendChild(subject);
        detailsBox.appendChild(experience);
        detailsBox.appendChild(qualification);
        detailsBox.appendChild(about);
        detailsBox.appendChild(closeButton);

        modal.appendChild(detailsBox);
        container.appendChild(modal);

        modal.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.remove();
            }
        });

    } catch (error) {
        alert(error.message);
    }
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");

    window.location.href = "index.html";
}

loadStudentDashboard();
loadAllTeachers();

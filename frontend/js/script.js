
const API_URL = "http://127.0.0.1:8000";

function showLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("message").textContent = "";
}

function showRegister() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("message").textContent = "";
}

function showProfileFields() {
    const role = document.getElementById("registerRole").value;

    const studentFields = document.getElementById("studentFields");
    const teacherFields = document.getElementById("teacherFields");

    studentFields.style.display = role === "student" ? "block" : "none";
    teacherFields.style.display = role === "teacher" ? "block" : "none";

    document.getElementById("registerAge").required = role === "student";
    document.getElementById("registerReg").required = role === "student";
    document.getElementById("registerPlace").required = role === "student";

    document.getElementById("registerSubject").required = role === "teacher";
    document.getElementById("registerExperience").required = role === "teacher";
    document.getElementById("registerQualification").required = role === "teacher";
}

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const message = document.getElementById("message");
    const role = document.getElementById("registerRole").value;

    const userData = {
        name: document.getElementById("registerName").value.trim(),
        email: document.getElementById("registerEmail").value.trim(),
        password: document.getElementById("registerPassword").value,
        role: role
    };

    if (role !== "student" && role !== "teacher") {
        message.textContent = "Please select a valid role";
        return;
    }

    let profileData;

    if (role === "student") {
        profileData = {
            age: Number(document.getElementById("registerAge").value),
            registration_number: document.getElementById("registerReg").value.trim(),
            native_place: document.getElementById("registerPlace").value.trim(),
            progress: document.getElementById("registerProgress").value.trim() || null
        };

        if (
            profileData.age <= 0 ||
            !profileData.registration_number ||
            !profileData.native_place
        ) {
            message.textContent = "Please enter valid student profile details";
            return;
        }
    }

    if (role === "teacher") {
        profileData = {
            subject: document.getElementById("registerSubject").value.trim(),
            experience: Number(document.getElementById("registerExperience").value),
            qualification: document.getElementById("registerQualification").value.trim(),
            about: document.getElementById("registerAbout").value.trim() || null
        };

        if (
            !profileData.subject ||
            profileData.experience < 0 ||
            !profileData.qualification
        ) {
            message.textContent = "Please enter valid teacher profile details";
            return;
        }
    }

    try {
        message.textContent = "Creating your account...";

        const registerResponse = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const registerResult = await registerResponse.json();

        if (!registerResponse.ok) {
            message.textContent =
                registerResult.detail || "Registration failed";
            return;
        }

        message.textContent = "Account created. Creating your profile...";

        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: userData.email,
                password: userData.password
            })
        });

        const loginResult = await loginResponse.json();

        if (!loginResponse.ok) {
            message.textContent =
                "Account created, but automatic login failed. Please login manually.";
            return;
        }

        const profileEndpoint = role === "student"
            ? "/students/profile"
            : "/teachers/profile";

        const profileResponse = await fetch(`${API_URL}${profileEndpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${loginResult.access_token}`
            },
            body: JSON.stringify(profileData)
        });

        const profileResult = await profileResponse.json();

        if (!profileResponse.ok) {
            message.textContent =
                "Account created, but profile creation failed: " +
                (profileResult.detail || "Please contact support");

            return;
        }

        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");

        registerForm.reset();
        showProfileFields();

        message.textContent =
            "Registration and profile creation successful! Please login.";

    } catch (error) {
        message.textContent = "Backend connection failed";
    }
});

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const loginData = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem("access_token", result.access_token);

            const userResponse = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    "Authorization": `Bearer ${result.access_token}`
                }
            });

            const user = await userResponse.json();

            if (!userResponse.ok) {
                throw new Error("Unable to fetch user details");
            }

            localStorage.setItem("user_role", user.role);

            if (user.role === "student") {
                window.location.href = "student-dashboard.html";
            } else if (user.role === "teacher") {
                window.location.href = "teacher-dashboard.html";
            } else {
                document.getElementById("message").textContent =
                    "Invalid user role";
            }

        } else {
            document.getElementById("message").textContent =
                result.detail || "Login failed";
        }

    } catch (error) {
        document.getElementById("message").textContent =
            error.message || "Backend connection failed";
    }
});

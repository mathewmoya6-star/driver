const API_URL = "https://YOUR-RENDER-BACKEND.onrender.com"; // CHANGE THIS

async function login(email, password) {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Save session securely
    localStorage.setItem("token", data.session.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect
    window.location.href = "/dashboard.html";

  } catch (err) {
    alert(err.message);
  }
}

const API_URL = "https://YOUR-RENDER-BACKEND.onrender.com";

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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
      alert(data.error || "Login failed");
      return;
    }

    // Save token
    localStorage.setItem("token", data.session.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect
    window.location.href = "/dashboard.html";

  } catch (err) {
    console.error(err);
    alert("Network error. Try again.");
  }
}

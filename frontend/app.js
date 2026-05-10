
// ================= AUTH LOGIN =================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    // Save token (Supabase session)
    localStorage.setItem("token", data.session.access_token);

    alert("Login successful");

    // redirect to admin dashboard (optional)
    window.location.href = "/admin.html";

  } catch (err) {
    console.error(err);
    alert("Network error");
  }
}

// ================= AUTH HEADER =================
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token"),
  };
}

// ================= LOAD USERS =================
async function loadUsers() {
  try {
    const res = await fetch("/api/admin/users", {
      headers: authHeaders(),
    });

    if (!res.ok) {
      console.error("Failed to load users");
      return;
    }

    const users = await res.json();

    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    if (!users.length) {
      tbody.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.user_id}</td>
        <td>${user.user_id}@user</td>
        <td><span class="role-badge">learner</span></td>
        <td>—</td>
        <td>
          <button class="delete-btn" onclick="deleteUser('${user.user_id}')">
            Delete
          </button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    console.error(err);
  }
}

// ================= ADD USER =================
async function addUser() {
  const user_id = document.getElementById("user_id")?.value;

  if (!user_id) {
    alert("Enter user ID");
    return;
  }

  try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ user_id }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add user");
      return;
    }

    alert("User created");
    loadUsers();

  } catch (err) {
    console.error(err);
  }
}

// ================= DELETE USER =================
async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;

  try {
    const res = await fetch("/api/admin/users/" + id, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    alert("User deleted");
    loadUsers();

  } catch (err) {
    console.error(err);
  }
}

// ================= INIT =================
window.addEventListener("load", () => {
  // auto-load users if table exists
  if (document.getElementById("usersTableBody")) {
    loadUsers();
  }
});

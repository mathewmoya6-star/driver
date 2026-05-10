async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  console.log(data);

  if (data.error) {
    alert("Login failed: " + data.error);
  } else {
    alert("Login success!");
  }
}

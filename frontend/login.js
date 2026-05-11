<script type="module">
import { supabase } from "./supabase.js";

window.login = async function () {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      return alert("Enter email and password");
    }

    // LOGIN
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log(error);
      return alert(error.message);
    }

    console.log("LOGIN SUCCESS:", data);

    const user = data.user;

    // LOAD PROFILE
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    console.log("PROFILE:", profile);
    console.log("PROFILE ERROR:", profileError);

    if (profileError || !profile) {
      return alert("Profile not found");
    }

    // ADMIN CHECK
    if (profile.role !== "admin") {
      await supabase.auth.signOut();
      return alert("Access denied. Not admin.");
    }

    // SAVE SESSION
    localStorage.setItem("admin_user", JSON.stringify(profile));

    // REDIRECT
    window.location.href = "admin-dashboard.html";

  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
};
</script>

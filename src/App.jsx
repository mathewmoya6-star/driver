import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔐 Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState("dashboard");

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Vehicles
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition_rating: ""
  });

  // Courses
  const [courses, setCourses] = useState([]);

  // =============================
  // AUTH SESSION
  // =============================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // =============================
  // LOAD DATA
  // =============================
  useEffect(() => {
    if (session) {
      fetchVehicles();
      fetchCourses();
    }
  }, [session]);

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    setVehicles(data || []);
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*");

    setCourses(data || []);
  };

  // =============================
  // AUTH
  // =============================
  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email!");
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // =============================
  // VEHICLE LOGIC
  // =============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateValue = (year, mileage, condition) => {
    let base = 2000000;
    let agePenalty = (2026 - year) * 80000;
    let mileagePenalty = mileage * 2;
    let conditionBoost = condition * 50000;
    return Math.max(300000, base - agePenalty - mileagePenalty + conditionBoost);
  };

  const addVehicle = async (e) => {
    e.preventDefault();
    const user = (await supabase.auth.getUser()).data.user;

    const value = calculateValue(
      parseInt(form.year),
      parseInt(form.mileage),
      parseInt(form.condition_rating)
    );

    const { error } = await supabase.from("vehicles").insert([
      {
        ...form,
        owner_id: user.id,
        year: parseInt(form.year),
        mileage: parseInt(form.mileage),
        condition_rating: parseInt(form.condition_rating),
        estimated_value: value
      }
    ]);

    if (!error) {
      setForm({ make: "", model: "", year: "", mileage: "", condition_rating: "" });
      fetchVehicles();
    } else {
      alert(error.message);
    }
  };

  // =============================
  // UI PAGES
  // =============================

  if (!session) {
    return (
      <div style={{ padding: 30 }}>
        <h2>🚗 MEI DRIVE AFRICA</h2>

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <br /><br />

        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <br /><br />

        <button onClick={signIn}>Login</button>
        <button onClick={signUp}>Sign Up</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>🚗 MEI DRIVE AFRICA</h2>

      {/* NAV */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("auto")}>Auto Value</button>
        <button onClick={() => setPage("courses")}>Driver Academy</button>
        <button onClick={signOut}>Logout</button>
      </div>

      {/* DASHBOARD */}
      {page === "dashboard" && (
        <div>
          <h3>Welcome</h3>
          <p>Total Vehicles: {vehicles.length}</p>
          <p>Total Courses: {courses.length}</p>
        </div>
      )}

      {/* AUTO VALUE */}
      {page === "auto" && (
        <div>
          <h3>🚗 Auto Value</h3>

          <form onSubmit={addVehicle}>
            <input name="make" placeholder="Make" onChange={handleChange} value={form.make} />
            <input name="model" placeholder="Model" onChange={handleChange} value={form.model} />
            <input name="year" placeholder="Year" onChange={handleChange} value={form.year} />
            <input name="mileage" placeholder="Mileage" onChange={handleChange} value={form.mileage} />
            <input name="condition_rating" placeholder="Condition" onChange={handleChange} value={form.condition_rating} />
            <button type="submit">Add</button>
          </form>

          <ul>
            {vehicles.map((v) => (
              <li key={v.id}>
                {v.make} {v.model} ({v.year})  
                <br />
                💰 KES {v.estimated_value?.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* COURSES */}
      {page === "courses" && (
        <div>
          <h3>📚 Driver Academy</h3>

          {courses.length === 0 ? (
            <p>No courses yet</p>
          ) : (
            <ul>
              {courses.map((c) => (
                <li key={c.id}>
                  {c.title} - {c.category}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

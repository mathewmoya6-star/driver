function App() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>MEI DRIVE AFRICA</h1>

      <p style={styles.subtitle}>
        Kenya's Digital Driver Learning Platform
      </p>

      <button style={styles.button}>
        Start Learning
      </button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial",
    padding: "40px",
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },

  title: {
    fontSize: "40px",
    marginBottom: "10px"
  },

  subtitle: {
    fontSize: "18px",
    opacity: 0.8,
    marginBottom: "25px"
  },

  button: {
    padding: "12px 22px",
    backgroundColor: "#22c55e",
    border: "none",
    borderRadius: "10px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer"
  }
};

export default App;

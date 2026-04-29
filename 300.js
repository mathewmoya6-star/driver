const QUESTIONS = [
  // =========================
  // ROAD RULES (60+)
  // =========================
  {
    id: 1,
    category: "Road Rules",
    question: "What is the basic rule of the road in Kenya?",
    options: ["Keep left unless overtaking", "Keep right always", "Drive in the middle"],
    answer: "Keep left unless overtaking",
    difficulty: "easy"
  },
  {
    id: 2,
    category: "Road Rules",
    question: "At an uncontrolled junction, who has priority?",
    options: ["Vehicle from right", "Vehicle from left", "Fastest vehicle"],
    answer: "Vehicle from right",
    difficulty: "medium"
  },
  {
    id: 3,
    category: "Road Rules",
    question: "When is overtaking prohibited?",
    options: ["At bends and junctions", "On straight roads", "On highways only"],
    answer: "At bends and junctions",
    difficulty: "medium"
  },

  // =========================
  // ROAD SIGNS (70+)
  // =========================
  {
    id: 61,
    category: "Road Signs",
    question: "What does a red triangle sign mean?",
    options: ["Warning", "Stop", "Speed limit"],
    answer: "Warning",
    difficulty: "easy"
  },
  {
    id: 62,
    category: "Road Signs",
    question: "What does a blue circular sign indicate?",
    options: ["Mandatory instruction", "Danger", "Parking"],
    answer: "Mandatory instruction",
    difficulty: "easy"
  },

  // =========================
  // DOCUMENTS (40+)
  // =========================
  {
    id: 131,
    category: "Documents",
    question: "Which document must a driver always carry?",
    options: ["Driving license", "ID card only", "Passport"],
    answer: "Driving license",
    difficulty: "easy"
  },

  // =========================
  // VEHICLE CONTROLS (50+)
  // =========================
  {
    id: 171,
    category: "Controls",
    question: "What is the function of the clutch?",
    options: ["Disconnect engine from wheels", "Increase speed", "Steer vehicle"],
    answer: "Disconnect engine from wheels",
    difficulty: "easy"
  },

  // =========================
  // SAFETY (50+)
  // =========================
  {
    id: 221,
    category: "Safety",
    question: "What should you do after an accident?",
    options: ["Stop and report to police", "Drive away", "Ignore if minor"],
    answer: "Stop and report to police",
    difficulty: "easy"
  },

  // =========================
  // SCENARIOS (60+)
  // =========================
  {
    id: 271,
    category: "Scenarios",
    question: "What should you do at a roundabout?",
    options: ["Give way to traffic already inside", "Speed through", "Stop inside"],
    answer: "Give way to traffic already inside",
    difficulty: "medium"
  }
];

module.exports = QUESTIONS;

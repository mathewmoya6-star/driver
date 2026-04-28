// ==========================
// SMOOTH SCROLL NAVIGATION
// ==========================
document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',function(e){
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior:'smooth'
        });
    });
});

// ==========================
// QUESTION BANK (BASE)
// ==========================
const questionBank = [
{q:"Speed limit in school zone?", options:["30 km/h","50 km/h","80 km/h"], answer:0},
{q:"Double yellow line means?", options:["No parking","No stopping","Overtaking allowed"], answer:1},
{q:"Before changing lane, what must you do?", options:["Hoot","Mirror-Signal-Check blind spot","Accelerate"], answer:1},
{q:"What should you do when skidding?", options:["Brake hard","Turn sharply","Ease accelerator and steer gently"], answer:2},
{q:"Who has right of way at unmarked junction?", options:["From left","From right","Largest vehicle"], answer:1},
{q:"STOP sign requires?", options:["Slow down","Complete stop","Ignore"], answer:1},
{q:"Overtaking on a bend is?", options:["Allowed","Not allowed","Depends"], answer:1},
{q:"Driving at night requires?", options:["High speed","Use lights properly","Close eyes"], answer:1},
{q:"Seatbelt use is?", options:["Optional","Mandatory","Highway only"], answer:1},
{q:"Roundabout rule?", options:["Enter fast","Give way to traffic inside","Stop fully"], answer:1}
];

// ==========================
// AUTO-GENERATE UP TO 300
// ==========================
for(let i=11;i<=300;i++){
    questionBank.push({
        q:`NTSA Question ${i}: Safe driving requires?`,
        options:["Attention","Speed","Ignoring rules"],
        answer:0
    });
}

// ==========================
// GLOBAL STATE
// ==========================
let currentQuestions = [];
let userName = "";

// ==========================
// START EXAM
// ==========================
function startExam(){
    const quiz = document.getElementById("quiz");
    const result = document.getElementById("result");

    if(!quiz) return;

    quiz.innerHTML = "";
    if(result) result.innerText = "";

    // pick random 10
    currentQuestions = [...questionBank]
        .sort(()=>0.5 - Math.random())
        .slice(0,10);

    currentQuestions.forEach((item,index)=>{
        let html = `
        <div style="margin-bottom:20px">
            <p><b>${index+1}. ${item.q}</b></p>
            ${item.options.map((opt,i)=>`
                <label style="display:block;margin:5px 0;">
                    <input type="radio" name="q${index}" value="${i}">
                    ${opt}
                </label>
            `).join("")}
        </div>
        `;
        quiz.innerHTML += html;
    });
}

// ==========================
// SUBMIT EXAM
// ==========================
function submitExam(){
    let score = 0;

    currentQuestions.forEach((q,index)=>{
        let selected = document.querySelector(`input[name="q${index}"]:checked`);
        if(selected && parseInt(selected.value) === q.answer){
            score++;
        }
    });

    const result = document.getElementById("result");

    let message = `Score: ${score}/10`;

    if(score >= 7){
        message += " ✅ PASS!";
        triggerCertificate(score);
    } else {
        message += " ❌ FAIL - Try Again";
    }

    if(result) result.innerText = message;
}

// ==========================
// CERTIFICATE SYSTEM
// ==========================
function triggerCertificate(score){
    userName = prompt("Enter your full name for certificate:");

    if(!userName || userName.trim() === ""){
        userName = "Student";
    }

    const certText = `
🎉 DRIVERPREP KENYA CERTIFICATE 🎉

Name: ${userName}
Result: PASSED (${score}/10)
Course: NTSA Mock Test
Date: ${new Date().toLocaleDateString()}

✔ You are now certified in driver theory.
`;

    alert(certText);
}

// ==========================
// INIT AUTO LOAD
// ==========================
window.addEventListener("DOMContentLoaded", ()=>{
    if(document.getElementById("quiz")){
        startExam();
    }
});

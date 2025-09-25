// Simple, original education-themed quiz
const questions = [
  { q: "Which number is even?", a: ["7","12","15","21"], correct: 1 },
  { q: "Which planet is called the Red Planet?", a: ["Venus","Mars","Jupiter","Mercury"], correct: 1 },
  { q: "What does 'recycle' mean?", a: ["Use less water","Use again to make new things","Throw away","Burn it"], correct: 1 },
  { q: "How many minutes are in one hour?", a: ["30","45","60","90"], correct: 2 },
  { q: "Which is a healthy snack?", a: ["Crisps","Chocolate bar","Apple","Fizzy drink"], correct: 2 },
  { q: "What shape has 3 sides?", a: ["Square","Triangle","Circle","Rectangle"], correct: 1 },
  { q: "Library rules: which is best?", a: ["Shout loudly","Run","Respect quiet spaces","Hide books"], correct: 2 },
  { q: "Which sport uses a racket and a shuttlecock?", a: ["Football","Badminton","Basketball","Rugby"], correct: 1 }
];

let i = 0, score = 0;
const qEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const qIndexEl = document.getElementById("qIndex");
const nextBtn = document.getElementById("nextBtn");
const skipBtn = document.getElementById("skipBtn");
const restartBtn = document.getElementById("restartBtn");

function render() {
  qIndexEl.textContent = `Question ${i+1} of ${questions.length}`;
  feedbackEl.textContent = "";

  const { q, a } = questions[i];
  qEl.textContent = q;

  answersEl.innerHTML = "";
  a.forEach((text, idx) => {
    let btn = document.createElement("button");
    btn.textContent = text;
    btn.onclick = () => check(idx);
    answersEl.appendChild(btn);
  });

  nextBtn.style.display = "none";
}

function check(selectedIdx) {
  const { correct } = questions[i];
  if (selectedIdx === correct) {
    score++;
    scoreEl.textContent = score;
    feedbackEl.textContent = "✅ Correct!";
  } else {
    feedbackEl.textContent = "❌ Wrong!";
  }
  nextBtn.style.display = "inline-block";
}

function next() {
  i++;
  if (i < questions.length) {
    render();
  } else {
    qEl.textContent = "Quiz completed!";
    answersEl.innerHTML = "";
    feedbackEl.textContent = `Your score: ${score}/${questions.length}`;
    nextBtn.style.display = "none";
    skipBtn.style.display = "none";
    restartBtn.style.display = "inline-block";
  }
}

function skip() {
  next();
}

function restart() {
  i = 0; score = 0; scoreEl.textContent = "0";
  skipBtn.style.display = "inline-block";
  restartBtn.style.display = "none";
  render();
}

nextBtn.addEventListener("click", next);
skipBtn.addEventListener("click", skip);
restartBtn.addEventListener("click", restart);

render();

/* =========================================================
   QUIZ DATA SECTION
   Keep all questions here. Each question object has:
   - id: unique number
   - question: the question text
   - options: array of 4 possible answers
   - correctAnswer: the INDEX (0-3) of the correct option in "options"
   To change the quiz, just edit this array.
   ========================================================= */
const quizData = [
  {
    id: 1,
    question: "Which language runs in a web browser?",
    options: ["Java", "C", "Python", "JavaScript"],
    correctAnswer: 3
  },
  {
    id: 2,
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyperlinks and Text Markup Language",
      "Home Tool Markup Language"
    ],
    correctAnswer: 0
  },
  {
    id: 3,
    question: "Which CSS property is used to change the text color?",
    options: ["font-color", "text-color", "color", "foreground-color"],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "Which HTML tag is used to link an external CSS file?",
    options: ["<style>", "<script>", "<css>", "<link>"],
    correctAnswer: 3
  },
  {
    id: 5,
    question: "Which symbol is used for comments in JavaScript (single line)?",
    options: ["<!-- -->", "//", "/* */", "#"],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "Which method is used to select an element by its id in JavaScript?",
    options: [
      "document.querySelectorId()",
      "document.getElementById()",
      "document.getElement()",
      "document.selectId()"
    ],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "Which data type is returned by the 'typeof' operator for an array?",
    options: ["array", "object", "list", "undefined"],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "Which HTML element is used to display a progress bar natively?",
    options: ["<progress>", "<bar>", "<loading>", "<meter-bar>"],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "Which CSS layout model is best for one-dimensional alignment (row or column)?",
    options: ["Grid", "Flexbox", "Float", "Table"],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "Which JavaScript keyword declares a variable that cannot be reassigned?",
    options: ["let", "var", "const", "static"],
    correctAnswer: 2
  }
];

/* =========================================================
   STATE VARIABLES
   These variables track the quiz's current state as the
   user progresses through it.
   ========================================================= */
let currentQuestionIndex = 0;      // index of the question currently shown
let userAnswers = [];              // stores the option index the user picked for each question (null if unanswered)
let timeRemaining = 10 * 60;       // 10 minutes, in seconds
let timerInterval = null;          // holds the setInterval reference so we can stop it later

/* =========================================================
   DOM ELEMENT REFERENCES
   ========================================================= */
const homeScreen = document.getElementById("home-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const questionCounterEl = document.getElementById("question-counter");
const timerEl = document.getElementById("timer");
const progressBarFillEl = document.getElementById("progress-bar-fill");
const questionTextEl = document.getElementById("question-text");
const optionsContainerEl = document.getElementById("options-container");
const warningMessageEl = document.getElementById("warning-message");

const scorePercentageEl = document.getElementById("score-percentage");
const scoreTotalEl = document.getElementById("score-total");
const correctCountEl = document.getElementById("correct-count");
const incorrectCountEl = document.getElementById("incorrect-count");
const resultMessageEl = document.getElementById("result-message");
const reviewContainerEl = document.getElementById("review-container");
const scoreCircleEl = document.querySelector(".score-circle");

/* =========================================================
   SCREEN NAVIGATION HELPER
   Switches which screen is visible by toggling a CSS class.
   ========================================================= */
function showScreen(screenToShow) {
  homeScreen.classList.remove("active-screen");
  quizScreen.classList.remove("active-screen");
  resultScreen.classList.remove("active-screen");
  screenToShow.classList.add("active-screen");
}

/* =========================================================
   START QUIZ
   Resets state, shows the quiz screen, renders question 1,
   and starts the countdown timer.
   ========================================================= */
function startQuiz() {
  currentQuestionIndex = 0;
  userAnswers = new Array(quizData.length).fill(null);
  timeRemaining = 10 * 60;

  showScreen(quizScreen);
  renderQuestion();
  startTimer();
}

/* =========================================================
   RENDER QUESTION
   Draws the current question and its 4 options on screen,
   and updates the question counter + progress bar.
   ========================================================= */
function renderQuestion() {
  const question = quizData[currentQuestionIndex];

  // Update "Question X of 10" text
  questionCounterEl.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;

  // Update progress bar width as a percentage
  const progressPercent = ((currentQuestionIndex + 1) / quizData.length) * 100;
  progressBarFillEl.style.width = `${progressPercent}%`;

  // Show the question text
  questionTextEl.textContent = question.question;

  // Clear any previous options and warning message
  optionsContainerEl.innerHTML = "";
  warningMessageEl.textContent = "";

  // Create a clickable div for each option
  question.options.forEach((optionText, index) => {
    const optionEl = document.createElement("div");
    optionEl.classList.add("option");
    optionEl.textContent = optionText;

    // If the user already answered this question (e.g. went back), keep it highlighted
    if (userAnswers[currentQuestionIndex] === index) {
      optionEl.classList.add("selected");
    }

    optionEl.addEventListener("click", () => selectOption(index));
    optionsContainerEl.appendChild(optionEl);
  });

  // Change button label to "Submit" on the last question
  nextBtn.textContent = currentQuestionIndex === quizData.length - 1 ? "Submit" : "Next";
}

/* =========================================================
   SELECT OPTION
   Called when the user clicks an option. Stores the answer
   and visually highlights the selected option.
   ========================================================= */
function selectOption(optionIndex) {
  userAnswers[currentQuestionIndex] = optionIndex;
  warningMessageEl.textContent = "";

  // Remove "selected" class from all options, then add it to the clicked one
  const allOptionEls = optionsContainerEl.querySelectorAll(".option");
  allOptionEls.forEach((el) => el.classList.remove("selected"));
  allOptionEls[optionIndex].classList.add("selected");
}

/* =========================================================
   NEXT BUTTON HANDLER
   Moves to the next question, or submits the quiz if this
   was the last question. Blocks progress if no answer was
   selected yet.
   ========================================================= */
function handleNextClick() {
  if (userAnswers[currentQuestionIndex] === null) {
    warningMessageEl.textContent = "Please select an answer before continuing.";
    return;
  }

  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    submitQuiz();
  }
}

/* =========================================================
   TIMER
   Counts down from 10 minutes. Updates the display every
   second. Auto-submits the quiz when it reaches 0.
   ========================================================= */
function startTimer() {
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  // padStart ensures we always show two digits, e.g. "09:05"
  timerEl.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Turn the timer red once under 1 minute remains, as a visual warning
  timerEl.classList.toggle("timer-warning", timeRemaining <= 60);
}

/* =========================================================
   SUBMIT QUIZ
   Stops the timer and moves the user to the results screen.
   ========================================================= */
function submitQuiz() {
  clearInterval(timerInterval);
  showResults();
  showScreen(resultScreen);
}

/* =========================================================
   SCORE CALCULATION
   Compares each stored user answer against the correct
   answer and counts how many are right.
   ========================================================= */
function calculateScore() {
  let correctCount = 0;

  quizData.forEach((question, index) => {
    if (userAnswers[index] === question.correctAnswer) {
      correctCount++;
    }
  });

  return correctCount;
}

/* =========================================================
   SHOW RESULTS
   Fills in the result screen: score, percentage, message,
   and the full answer review list.
   ========================================================= */
function showResults() {
  const totalQuestions = quizData.length;
  const correctCount = calculateScore();
  const incorrectCount = totalQuestions - correctCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  scoreTotalEl.textContent = `${correctCount} / ${totalQuestions}`;
  correctCountEl.textContent = correctCount;
  incorrectCountEl.textContent = incorrectCount;
  scorePercentageEl.textContent = `${percentage}%`;

  // Fill the circular progress visual using a conic-gradient
  scoreCircleEl.style.background = `conic-gradient(#6a4bd6 ${percentage}%, #eee ${percentage}%)`;

  // Choose a message based on performance
  let message;
  if (percentage >= 80) {
    message = "Excellent work! You really know your stuff.";
  } else if (percentage >= 50) {
    message = "Good effort! A little more practice and you'll master it.";
  } else {
    message = "Keep practicing — you'll improve with more attempts.";
  }
  resultMessageEl.textContent = message;

  renderReview();
}

/* =========================================================
   ANSWER REVIEW
   Builds a list showing each question, what the user chose,
   the correct answer, and whether they got it right.
   ========================================================= */
function renderReview() {
  reviewContainerEl.innerHTML = "";

  quizData.forEach((question, index) => {
    const userAnswerIndex = userAnswers[index];
    const isCorrect = userAnswerIndex === question.correctAnswer;

    // "Not answered" text if the user never selected an option (e.g. time ran out)
    const userAnswerText = userAnswerIndex !== null
      ? question.options[userAnswerIndex]
      : "Not answered";
    const correctAnswerText = question.options[question.correctAnswer];

    const itemEl = document.createElement("div");
    itemEl.classList.add("review-item");

    itemEl.innerHTML = `
      <div class="review-question">
        ${index + 1}. ${question.question}
        <span class="status-badge ${isCorrect ? "status-correct" : "status-incorrect"}">
          ${isCorrect ? "Correct" : "Incorrect"}
        </span>
      </div>
      <div class="review-answer-row">Your answer: <strong>${userAnswerText}</strong></div>
      <div class="review-answer-row">Correct answer: <strong>${correctAnswerText}</strong></div>
    `;

    reviewContainerEl.appendChild(itemEl);
  });
}

/* =========================================================
   RESTART QUIZ
   Sends the user back to the home screen and resets state
   so they can take the quiz again from question 1.
   ========================================================= */
function restartQuiz() {
  clearInterval(timerInterval);
  currentQuestionIndex = 0;
  userAnswers = [];
  timeRemaining = 10 * 60;
  showScreen(homeScreen);
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", handleNextClick);
restartBtn.addEventListener("click", restartQuiz);
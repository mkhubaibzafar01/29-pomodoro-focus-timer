const timerDisplay = document.querySelector("#timer");
const timerRing = document.querySelector("#timerRing");
const modeLabel = document.querySelector("#modeLabel");
const timerStatus = document.querySelector("#timerStatus");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
const sessionsDisplay = document.querySelector("#sessions");
const message = document.querySelector("#message");

const durationInputs = {
  focus: document.querySelector("#focusDuration"),
  short: document.querySelector("#shortDuration"),
  long: document.querySelector("#longDuration"),
};

const modes = {
  focus: { label: "FOCUS SESSION", name: "Focus", color: "#a69aff" },
  short: { label: "SHORT BREAK", name: "Short Break", color: "#76e0bd" },
  long: { label: "LONG BREAK", name: "Long Break", color: "#79b8ff" },
};

let durations = {
  focus: 25,
  short: 5,
  long: 15,
};

let currentMode = "focus";
let remainingSeconds = durations.focus * 60;
let totalSeconds = remainingSeconds;
let sessions = 0;
let timerId = null;
let running = false;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);

  const progress = totalSeconds > 0
    ? (totalSeconds - remainingSeconds) / totalSeconds
    : 0;

  const degrees = progress * 360;
  const color = modes[currentMode].color;

  timerRing.style.background =
    `conic-gradient(${color} ${degrees}deg, #45405f ${degrees}deg)`;

  modeLabel.textContent = modes[currentMode].label;
  sessionsDisplay.textContent = sessions;

  document.title = `${formatTime(remainingSeconds)} — FocusFlow`;
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  running = false;
  startButton.textContent = "▶ Start " + modes[currentMode].name;
}

function startTimer() {
  if (running) {
    stopTimer();
    timerStatus.textContent = "Timer paused";
    return;
  }

  if (remainingSeconds <= 0) {
    return;
  }

  running = true;
  startButton.textContent = "Ⅱ Pause";
  timerStatus.textContent = "Stay focused...";

  timerId = setInterval(() => {
    remainingSeconds--;
    updateDisplay();

    if (remainingSeconds <= 0) {
      stopTimer();

      if (currentMode === "focus") {
        sessions++;
        timerStatus.textContent = "Focus session completed! 🎉";
      } else {
        timerStatus.textContent = "Break completed. Ready to focus?";
      }

      sessionsDisplay.textContent = sessions;
      message.textContent = "Great work! Select a mode for your next session.";

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("FocusFlow", {
          body: `${modes[currentMode].name} completed!`,
        });
      }
    }
  }, 1000);
}

function resetTimer() {
  stopTimer();
  remainingSeconds = durations[currentMode] * 60;
  totalSeconds = remainingSeconds;
  timerStatus.textContent = "Ready when you are";
  message.textContent = "";
  updateDisplay();
}

function switchMode(mode) {
  stopTimer();
  currentMode = mode;
  remainingSeconds = durations[mode] * 60;
  totalSeconds = remainingSeconds;

  document.querySelectorAll(".mode").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  timerStatus.textContent = "Ready when you are";
  message.textContent = "";
  updateDisplay();

  startButton.textContent = "▶ Start " + modes[mode].name;
}

document.querySelectorAll(".mode").forEach((button) => {
  button.addEventListener("click", () => switchMode(button.dataset.mode));
});

startButton.addEventListener("click", startTimer);
resetButton.addEventListener("click", resetTimer);

document.querySelector("#applyButton").addEventListener("click", () => {
  const newDurations = {};

  for (const [mode, input] of Object.entries(durationInputs)) {
    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 1 || value > (mode === "focus" ? 120 : 60)) {
      message.textContent = "Enter valid whole-number durations within the allowed limits.";
      return;
    }

    newDurations[mode] = value;
  }

  durations = newDurations;
  resetTimer();
  message.textContent = "Timer settings updated successfully!";
});

updateDisplay();
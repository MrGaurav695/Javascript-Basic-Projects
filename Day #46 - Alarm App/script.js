const timerRef = document.querySelector(".current-time");
const statusText = document.querySelector(".status-text");
const hourInput = document.getElementById("hour-input");
const minuteInput = document.getElementById("minute-input");
const alarmForm = document.getElementById("alarm-form");
const periodSelect = document.getElementById("period-select");
const alarmsList = document.querySelector(".alarms-list");
const clearAllButton = document.getElementById("clear-alarms");
const stopAlarmButton = document.getElementById("stop-alarm");
const alarmSound = new Audio("./alarm.mp3");
alarmSound.loop = true;

const STORAGE_KEY = "alarm-app-data";
let alarms = [];

const formatTwoDigits = (value) => value.toString().padStart(2, "0");

const getPeriod = (hour24) => (hour24 >= 12 ? "PM" : "AM");

const getHour12 = (hour24) => {
    const hour = hour24 % 12;
    return formatTwoDigits(hour === 0 ? 12 : hour);
};

const getCurrentTime = () => {
    const now = new Date();
    const hours = getHour12(now.getHours());
    const minutes = formatTwoDigits(now.getMinutes());
    const seconds = formatTwoDigits(now.getSeconds());
    const period = getPeriod(now.getHours());

    return {
        full: `${hours}:${minutes}:${seconds} ${period}`,
        short: `${hours}:${minutes} ${period}`,
    };
};

const saveAlarms = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));

const updateStatusText = () => {
    const count = alarms.length;
    statusText.textContent = count
        ? `${count} alarm${count === 1 ? "" : "s"} set`
        : "No alarms set";
};

const createAlarmElement = (alarm) => {
    const alarmElement = document.createElement("div");
    alarmElement.className = `alarm ${alarm.active ? "active" : "inactive"}`;
    alarmElement.dataset.id = alarm.id;
    alarmElement.innerHTML = `
        <span class="alarm-time">${alarm.time}</span>
        <label class="alarm-toggle">
            <input type="checkbox" ${alarm.active ? "checked" : ""}>
            <span class="slider"></span>
        </label>
        <button type="button" class="delete-button" aria-label="Delete alarm">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;

    const checkbox = alarmElement.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", () => toggleAlarm(alarm.id));
    alarmElement.querySelector(".delete-button").addEventListener("click", () => deleteAlarm(alarm.id));

    return alarmElement;
};

const renderAlarms = () => {
    alarmsList.innerHTML = "";
    alarms.forEach((alarm) => alarmsList.appendChild(createAlarmElement(alarm)));
    updateStatusText();
};

const playAlarmSound = () => {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(() => {});
    stopAlarmButton.classList.remove("hidden");
};

const stopAlarmSound = () => {
    alarmSound.pause();
    stopAlarmButton.classList.add("hidden");
};

const triggerDueAlarms = () => {
    const { full, short } = getCurrentTime();
    timerRef.textContent = full;

    alarms.forEach((alarm) => {
        if (!alarm.active || alarm.time !== short) return;
        if (alarm.lastTriggered === short) return;

        alarm.lastTriggered = short;
        saveAlarms();
        playAlarmSound();
    });
};

const getAlarmTime = (hour, minute, period) => `${formatTwoDigits(hour)}:${formatTwoDigits(minute)} ${period}`;

const addAlarm = (hour, minute, period) => {
    const time = getAlarmTime(hour, minute, period);
    if (alarms.some((alarm) => alarm.time === time)) {
        alert("You already have an alarm set for this time.");
        return;
    }

    alarms.push({
        id: `${Date.now()}-${time}`,
        time,
        active: true,
        lastTriggered: "",
    });

    saveAlarms();
    renderAlarms();
};

const toggleAlarm = (id) => {
    const alarm = alarms.find((item) => item.id === id);
    if (!alarm) return;

    alarm.active = !alarm.active;
    saveAlarms();
    renderAlarms();

    if (!alarm.active) {
        stopAlarmSound();
    }
};

const deleteAlarm = (id) => {
    alarms = alarms.filter((item) => item.id !== id);
    saveAlarms();
    renderAlarms();
};

const clearAllAlarms = () => {
    if (!alarms.length || !confirm("Delete all alarms?")) return;
    alarms = [];
    saveAlarms();
    renderAlarms();
    stopAlarmSound();
};

const restoreAlarms = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
        alarms = JSON.parse(savedData) || [];
    } catch {
        alarms = [];
    }
};

alarmForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const hour = Math.min(Math.max(parseInt(hourInput.value, 10) || 1, 1), 12);
    const minute = Math.min(Math.max(parseInt(minuteInput.value, 10) || 0, 0), 59);
    const period = periodSelect.value === "PM" ? "PM" : "AM";

    addAlarm(hour, minute, period);
    hourInput.value = "";
    minuteInput.value = "";
    periodSelect.value = "AM";
    hourInput.focus();
});

clearAllButton.addEventListener("click", clearAllAlarms);
stopAlarmButton.addEventListener("click", stopAlarmSound);

window.addEventListener("load", () => {
    restoreAlarms();
    renderAlarms();
    triggerDueAlarms();
    setInterval(triggerDueAlarms, 1000);
});
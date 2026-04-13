emailjs.init("PUBLIC_KEY"); // Replace with your EmailJS User ID

const sendBtn = document.querySelector('.send-btn');
const result = document.querySelector('.result');
const form = document.querySelector('form');

form.addEventListener('submit', sendEmail);

function sendEmail(event) {
    event.preventDefault();

    // Get the form data
    const to = document.getElementById("to").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    // Basic validation
    if (!to || !subject || !message) {
        showResult("Please fill in all fields.", "error");
        return;
    }

    if (!isValidEmail(to)) {
        showResult("Please enter a valid email address.", "error");
        return;
    }

    // Disable button and show loading
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";

    // Send the email using EmailJS
    emailjs.send("SERVICE_ID", "TEMPLATE_ID", {
        to_email: to,
        subject: subject,
        message: message
    })
        .then(function () {
            showResult("Email sent successfully!", "success");
            form.reset();
        }, function (error) {
            console.error("Email sending failed:", error);
            showResult("Email sending failed. Please try again.", "error");
        })
        .finally(() => {
            // Re-enable button
            sendBtn.disabled = false;
            sendBtn.textContent = "Send Email";
        });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showResult(message, type) {
    result.textContent = message;
    result.className = `result ${type}`;
    result.style.opacity = 1;

    // Hide after 5 seconds
    setTimeout(() => {
        result.style.opacity = 0;
    }, 5000);
}
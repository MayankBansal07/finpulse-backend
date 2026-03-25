const express = require('express');
const cors = require('cors');
const nodemailer = require("nodemailer");
require('dotenv').config(); // 👈 Added to load .env variables
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: "*"
}));
app.use(express.json());

// 3. Health check route
app.get("/", (req, res) => {
    res.send("Backend is live");
});

// Configure Nodemailer Transporter
// Use environment variables for security in production
const transporter = nodemailer.createTransport({
  service: 'gmail', // 👈 Simpler way for Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Check if variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️  EMAIL_USER or EMAIL_PASS not set in environment variables!");
}

app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Email Validation
    if (!email || !email.includes("@") || !email.includes(".")) {
        return res.status(400).json({ message: "Invalid email" });
    }

    console.log('--- New Contact Form Submission ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('-----------------------------------');

    const autoMessage = `
Hello ${name},

Thank you for contacting FinPulse.

We have received your request:
"${message}"

Our team will get back to you shortly.

Regards,
FinPulse Team
`;

    try {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "New Contact Form",
    text: `Name: ${name}, Email: ${email}, Message: ${message}`
  });

  console.log("Email sent:", info.response);

  res.json({ success: true });

} catch (error) {
  console.error("FULL ERROR:", error);  // 👈 VERY IMPORTANT
  res.status(500).json({ error: error.message });
}
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


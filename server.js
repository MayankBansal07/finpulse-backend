const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.get("/", (req, res) => {
  res.send("Backend is live");
});

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!email || !email.includes("@") || !email.includes(".")) {
    return res.status(400).json({ message: "Invalid email" });
  }

  console.log("New submission:", name, email);

  try {
    // Email to you
    await transporter.sendMail({
      from: `"FinPulse" <${process.env.SMTP_USER}>`,
      to: "maybansal2021@gmail.com",
      subject: "New Contact Form",
      html: `
        <h3>New Contact Request</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `
    });

    // Confirmation email to user
    await transporter.sendMail({
      from: `"FinPulse" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "We received your request",
      html: `
        <h3>Hello ${name},</h3>
        <p>We received your message:</p>
        <p>"${message}"</p>
        <br/>
        <p>We will contact you soon.</p>
        <p><b>FinPulse Team</b></p>
      `
    });

    res.json({ success: true });

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

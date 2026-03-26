const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Configure SMTP transporter for Gmail (587 with TLS)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // logger: true,   // log to console
  // debug: true     // include SMTP conversation
  family: 4 // Use IPv4 to avoid potential IPv6 issues
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
    // 1. Admin notification
    await transporter.sendMail({
  from: process.env.SMTP_USER,        // ✅ must match your Gmail login
  to: process.env.SMTP_USER,          // ✅ admin notification goes to your Gmail
  replyTo: email,                     // ✅ lets you reply directly to the customer
  subject: "New Contact Form",
  text: `New request from ${name} (${email}): ${message}`, // plain text fallback
  html: `
    <h3>New Contact Request</h3>
    <p><b>Name:</b> ${name}</p>
    <p><b>Email:</b> ${email}</p>
    <p><b>Message:</b> ${message}</p>
  `
});

    const info = await transporter.sendMail({
  from: process.env.SMTP_USER,        // ✅ must match your Gmail login
  to: email,                          // ✅ customer’s email
  replyTo: process.env.SMTP_USER,     // ✅ replies come back to you
  subject: "FinPulse – Consultation Request Received",
  text: `Hello ${name}, we received your message: "${message}". We'll contact you soon.`,
  html: `
    <h3>Hello ${name},</h3>
    <p>We received your message:</p>
    <p>"${message}"</p>
    <br/>
    <p>We will contact you soon.</p>
    <p><b>FinPulse Team</b></p>
  `
});
console.log("Customer mail sent:", info.messageId);

    res.json({ success: true });

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});
// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

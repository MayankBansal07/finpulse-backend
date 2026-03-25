const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

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
    await resend.emails.send({
      from: "FinPulse <onboarding@resend.dev>",
      to: "maybansalexams@gmail.com",
      subject: "New Contact Form",
      html: `
        <h3>New Contact Request</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `
    });
    await resend.emails.send({
    from: "FinPulse <onboarding@resend.dev>",
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
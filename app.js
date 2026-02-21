const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = 8000;

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

/* ================= EMAIL CONFIG ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  // res.send("I am a server 🚀");
});

/* ================= CONTACT API ================= */

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Fields cannot be empty",
    });
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email",
    });
  }

  try {
    /* ================= EMAIL TO YOU ================= */

    await transporter.sendMail({
      from: `"${name} via Portfolio" <${process.env.EMAIL_USER}>`,
      replyTo: email, // ← IMPORTANT (reply goes to user)
      to: process.env.RECEIVER_EMAIL,
      subject: `Portfolio Message from ${name}`,
      text: `
      Name: ${name}
      Email: ${email}

      Message:
      ${message}
      `,
    });

    /* ================= AUTO REPLY TO USER ================= */

    await transporter.sendMail({
      from: `"Prabal Kumar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thanks for reaching out 👋",
      text: `
      Hi ${name},

      Thanks for contacting me! I’ve received your message and will get back to you soon.

      Here’s a copy of your message:

      "${message}"

      Best regards,
      Prabal Kumar
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.log("Mail error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to send mail",
    });
  }
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  // console.log(`I am live on port ${PORT}`);
});

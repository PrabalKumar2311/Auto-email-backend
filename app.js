const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

/* ================= RESEND ================= */

const resend = new Resend(process.env.RESEND_API_KEY);

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://prabal-kumar-portfolio.netlify.app",
    ],
  })
);

app.use(express.json());

/* ================= HEALTH ROUTE ================= */

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* ================= CONTACT API ================= */

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  /* ===== VALIDATION ===== */

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
    /* ===== EMAIL TO YOU ===== */

    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: process.env.RECEIVER_EMAIL,
      reply_to: email,
      subject: `Portfolio Message from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    /* ===== AUTO REPLY TO USER ===== */

    await resend.emails.send({
      from: "Prabal Kumar <onboarding@resend.dev>",
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
    console.error("Resend error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to send mail",
    });
  }
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
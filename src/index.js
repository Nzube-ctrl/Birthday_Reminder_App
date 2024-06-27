require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;
const User = require("./models/user.model.js");
const path = require("node:path");
const registerValidator = require("./validator.js");
const MONGO_URI = process.env.MONGO_URI;

const app = express();

app.use(express.json());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/register", registerValidator, async (req, res) => {
  try {
    const { username, email, dob } = req.body;
    const newUser = new User({
      username: username,
      email: email,
      dob: dob,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!", newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something Broke");
});

async function sendBirthdayEmails() {
  const today = new Date();
  const users = await User.find({
    dob: {
      $dayOfMonth: today.getDate(),
      $month: today.getMonth() + 1,
    },
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  users.forEach((user) => {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Happy Birthday!",
      text: `Dear ${user.username},\n\nWishing you a very Happy Birthday!\n\nBest Regards`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });
  });
}

cron.schedule("0 7 * * *", sendBirthdayEmails);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to database");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

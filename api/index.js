import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import { WebSocketServer } from "ws";
import Message from "./models/Message.js";

dotenv.config();
mongoose.connect(process.env.MONGO_URL);

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
const port = process.env.PORT || 4040;

// console.log(process.env.MONGO_URL);
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: "https://mern-chat-1-j40hxlk2f-komal-meenas-projects.vercel.app/",
    // origin:"https://mern-chat-2-vfiq.onrender.com",
    // origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

app.get("/api/test", (req, res) => {
  res.json("test ok");
});

app.get("/api/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  console.log({ userId, ourUserId });
  const messages = await Message.find({
    sender: {
      $in: [userId, ourUserId],
    },
    recipient: {
      $in: [userId, ourUserId],
    },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get("/api/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

app.get("/api/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userdata) => {
      if (err) throw err;

      res.json(userdata);
    });
  } else {
    res.status(401).json("no token");
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  console.log(`working`);

  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);

    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwtSecret,
        {},
        (err, token) => {
          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: foundUser._id,
          });
        }
      );
    }
  }
});

app.post("/api/logout", (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
});

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username: username,
      password: hashedPassword,
    });

    jwt.sign(
      {
        userId: createdUser._id,
        username,
      },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
          });
      }
    );
  } catch (error) {
    if (error) throw error;
    res.status(500).json("error");
  }
});

// Message.deleteMany({})
//   .then(() => {
//     console.log("All messages deleted");
//   })
//   .catch((err) => {
//     console.log("Error deleting messages:", err);
//   });

const server = app.listen(port);

const wss = new WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log("dead");
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    // console.log("pong");
    clearTimeout(connection.deathTimer);
  });

  //read the username and id from the cookie connection
  const cookies = req.headers.cookie;

  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));

    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];

      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;
    console.log("message data", messageData);
    //  console.log(`haohd`);
    // console.log({ recipient });
    // console.log({ text});
    if (recipient && text) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              _id: messageDoc._id,
            })
          )
        );
    }
  });

  //notify everyone about online people (when someone connects)
  notifyAboutOnlinePeople();
});

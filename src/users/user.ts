import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  let LastReceivedMessage: string | null = null; // Updated to store string type messages
  let LastSentMessage: string | null = null; // Assuming you might implement sending functionality later
  
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  _user.get("/getLastSentMessage", (req, res) => {
    res.json({ result: LastSentMessage });
  });

  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({ result: LastReceivedMessage });
  });

  // POST route to receive a message
  _user.post("/message", (req, res) => {
    const body: SendMessageBody = req.body; // Assuming the body will only contain the message for simplicity

    // Update the last received message
    LastReceivedMessage = body.message;

    // Acknowledge the receipt of the message
    res.status(200).send('success');
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(`User ${userId} is listening on port ${BASE_USER_PORT + userId}`);
  });

  return server;
}

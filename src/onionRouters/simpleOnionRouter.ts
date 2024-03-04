/*
import bodyParser from "body-parser";
import express from "express";
import { nodeRegistry } from '../registry/registry'
import { BASE_ONION_ROUTER_PORT } from "../config";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();

  //work in progress
  let lastReceivedEncryptedMessage: null = null ;
  let LastReceivedDecryptedMessage: null = null ;
  let LastMessageDestination: null= null;
  let pubKey

  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // Implementing the status route
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });
  
//Work in progress
  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: LastReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: LastMessageDestination });
  });

  onionRouter.post('/registerNode', (req, res) => {
    const { nodeId, pubKey } = req.body;
    // Prevent duplicate registrations
    const exists = nodeRegistry.some(node => node.nodeId === nodeId);
    if (!exists) {
      nodeRegistry.push({ nodeId, pubKey });
      res.status(200).json({ message: 'Node registered successfully.' });
    } else {
      res.status(409).json({ message: 'Node already registered.' });
    }
  });

  onionRouter.get('/getNodeRegistry', (req, res) => {
    res.json({ nodes: nodeRegistry });
  });

  onionRouter.get("/getPrivateKey", (req, res) => {
    const privatekey = {result: ' ' }
    res.json(privatekey);
  });

  
  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });
  
  return server;
}
*/


import bodyParser from "body-parser";
import express from "express";
import { nodeRegistry } from '../registry/registry';
import { BASE_ONION_ROUTER_PORT } from "../config";
import { generateRsaKeyPair, exportPubKey, exportPrvKey } from '../crypto'; // Adjust the import path as necessary

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();

  // Initialize message storage variables
  let lastReceivedEncryptedMessage:any = null;
  let lastReceivedDecryptedMessage:any = null;
  let lastMessageDestination:any = null;

  // Generate a new RSA key pair for the node
  const { publicKey, privateKey } = await generateRsaKeyPair();

  // Convert the public key to a base64 string for registration
  const pubKeyBase64 = await exportPubKey(publicKey);
  const prvKeyBase64 = await exportPrvKey(privateKey);

  // Register the node with the base64-encoded public key
  const isNodeRegistered = nodeRegistry.some(node => node.nodeId === nodeId);
  if (!isNodeRegistered) {
    nodeRegistry.push({ nodeId, pubKey: pubKeyBase64 });
    console.log(`Node ${nodeId} registered successfully with public key.`);
  }

  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // Status route to check if the router is live
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  // Routes for retrieving last received messages and destination
  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: lastMessageDestination });
  });

  // WARNING: Exposing private keys over an API is a significant security risk.
  // This endpoint should only be used for educational purposes or in a controlled testing environment.
  onionRouter.get("/getPrivateKey", async (req, res) => {
    // Convert the private key to a base64 string for retrieval
    const prvKeyBase64 = await exportPrvKey(privateKey);

    if (prvKeyBase64) {
      res.json({ result: prvKeyBase64 });
    }
  });

  // Listen on a port unique to this node
  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(`Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`);
  });

  return server;
}

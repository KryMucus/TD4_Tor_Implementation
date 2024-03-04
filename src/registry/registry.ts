import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};
// This array will act as an in-memory registry for nodes
export let nodeRegistry: Node[] = [];

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  _registry.get("/status/", (req, res) => {
    res.send("live");
  });

  // Route to register a node
  _registry.post('/registerNode', (req: Request, res: Response) => {
    const { nodeId, pubKey }: Node = req.body;

    // Check if the node is already registered
    const isNodeRegistered = nodeRegistry.some(node => node.nodeId === nodeId);

    if (isNodeRegistered) {
      res.status(409).send('Node already registered.');
    } else {
      // Add the node to the registry
      nodeRegistry.push({ nodeId, pubKey });
      res.status(201).send('Node registered successfully.');
    }
  });

  // Route to get the list of registered nodes
  _registry.get('/getNodeRegistry', (req, res) => {
    res.json({ nodes: nodeRegistry });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}


/**
 * 
 * import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  
  _registry.get("/status/", (req, res) => {
    res.send("live");
  });

  _registry.get('/getNodeRegistry', (req, res) => {
    res.json({ nodes: nodeRegistry });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
 * 
 */
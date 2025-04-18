import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { grillItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for grill items
  app.get("/api/grill-items", async (req, res) => {
    const items = await storage.getGrillItems();
    res.json(items);
  });

  app.post("/api/grill-items", async (req, res) => {
    try {
      const data = grillItemSchema.parse(req.body);
      const item = await storage.addGrillItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create grill item" });
      }
    }
  });

  app.get("/api/grill-items/:id", async (req, res) => {
    const item = await storage.getGrillItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Grill item not found" });
    }
    res.json(item);
  });

  app.delete("/api/grill-items/:id", async (req, res) => {
    const success = await storage.removeGrillItem(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Grill item not found" });
    }
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}

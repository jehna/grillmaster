import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// The base users table (required by setup)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Grill items schema - TypeScript only as we're using in-memory storage
export type GrillItemType = {
  id: string;
  name: string;
  type: 'veggie' | 'meat' | 'fish';
  cookTimePerSide: number;
  cookTimeSecondSide?: number;
  sides: number;
  notes: string;
};

// Schema for adding custom grill items
export const grillItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["veggie", "meat", "fish"]),
  cookTimePerSide: z.number().min(0.5, "Cooking time must be at least 0.5 minutes"),
  cookTimeSecondSide: z.number().min(0.5, "Cooking time must be at least 0.5 minutes").optional(),
  sides: z.number().min(1, "Must have at least 1 side"),
  notes: z.string().optional(),
});

export type InsertGrillItem = z.infer<typeof grillItemSchema>;

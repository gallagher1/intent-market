import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  userType: text("user_type").notNull(), // "consumer" or "producer"
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  userType: true,
});

// Purchase intent schema
export const intents = pgTable("intents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  timeframe: text("timeframe").notNull(), // e.g. "Within 3 weeks"
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  features: text("features").array(),
  brands: text("brands").array(),
  status: text("status").notNull().default("active"), // "active", "completed", "expired"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIntentSchema = createInsertSchema(intents).pick({
  userId: true,
  title: true,
  timeframe: true,
  budgetMin: true,
  budgetMax: true,
  features: true,
  brands: true,
});

// Producer offers schema
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  intentId: integer("intent_id").notNull(),
  producerId: integer("producer_id").notNull(),
  company: text("company").notNull(),
  product: text("product").notNull(),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  discount: text("discount"),
  expiresAt: timestamp("expires_at"),
  status: text("status").notNull().default("pending"), // "pending", "accepted", "rejected", "expired"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  intentId: true,
  producerId: true,
  company: true,
  product: true,
  price: true,
  originalPrice: true,
  discount: true,
  expiresAt: true,
});

// Completed purchases schema
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  intentId: integer("intent_id").notNull(),
  offerId: integer("offer_id"),
  userId: integer("user_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  details: jsonb("details"),
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  intentId: true,
  offerId: true,
  userId: true,
  details: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Intent = typeof intents.$inferSelect;
export type InsertIntent = z.infer<typeof insertIntentSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

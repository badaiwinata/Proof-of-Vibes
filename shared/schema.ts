import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for storing registered users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  solanaWallet: text("solana_wallet"),
});

// NFT table for storing minted NFTs - now "Digital Collectibles"
export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  imageUrl: text("image_url").notNull(),
  message: text("message"),
  template: text("template").notNull(),
  vibes: text("vibes").array().notNull(),
  mintAddress: text("mint_address"),
  
  // Claiming-related fields
  claimed: boolean("claimed").default(false),
  claimToken: text("claim_token"),
  claimEmail: text("claim_email"),
  claimedAt: timestamp("claimed_at"),
  recipientName: text("recipient_name"),
  
  // Event branding fields
  eventName: text("event_name").default("Proof of Vibes"),
  eventDate: text("event_date"),
  certificateId: text("certificate_id"), // For "Certificate of Authenticity"
  collectionId: text("collection_id"), // For grouping related NFTs into collections
  
  // Edition-related fields (for Editioned Minting)
  masterNftId: integer("master_nft_id"), // Reference to the master NFT (first edition)
  editionNumber: integer("edition_number"), // e.g., 1, 2, 3, etc.
  editionCount: integer("edition_count"), // Total number of editions in the set
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

// Temporary storage for photos taken in the photobooth
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  imageData: text("image_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  solanaWallet: true,
});

export const insertNftSchema = createInsertSchema(nfts).pick({
  userId: true,
  imageUrl: true,
  message: true,
  template: true,
  vibes: true,
  mintAddress: true,
  claimToken: true,
  claimEmail: true,
  claimed: true,
  claimedAt: true,
  recipientName: true,
  eventName: true,
  eventDate: true,
  certificateId: true,
  collectionId: true,
  metadata: true,
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  userId: true,
  sessionId: true,
  imageData: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertNft = z.infer<typeof insertNftSchema>;
export type Nft = typeof nfts.$inferSelect;

export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;

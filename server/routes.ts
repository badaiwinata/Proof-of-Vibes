import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertNftSchema, insertPhotoSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - all routes start with /api
  app.get("/api/nfts", async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    try {
      const nfts = await storage.getAllNfts(limit, offset);
      res.json({ nfts });
    } catch (error) {
      console.error("Error getting NFTs:", error);
      res.status(500).json({ message: "Failed to retrieve NFTs" });
    }
  });

  app.get("/api/nfts/:id", async (req: Request, res: Response) => {
    try {
      const nft = await storage.getNft(parseInt(req.params.id));
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
      }
      res.json({ nft });
    } catch (error) {
      console.error("Error getting NFT:", error);
      res.status(500).json({ message: "Failed to retrieve NFT" });
    }
  });

  // Photos API - for photobooth session
  app.post("/api/photos", async (req: Request, res: Response) => {
    try {
      const sessionId = req.body.sessionId || randomUUID();
      
      // Validate request body
      const validPhoto = insertPhotoSchema.safeParse({
        sessionId,
        userId: req.body.userId,
        imageData: req.body.imageData
      });
      
      if (!validPhoto.success) {
        return res.status(400).json({ 
          message: "Invalid photo data",
          errors: validPhoto.error.format()
        });
      }
      
      const photo = await storage.createPhoto(validPhoto.data);
      res.json({ photo, sessionId });
    } catch (error) {
      console.error("Error saving photo:", error);
      res.status(500).json({ message: "Failed to save photo" });
    }
  });

  app.get("/api/photos/session/:sessionId", async (req: Request, res: Response) => {
    try {
      const photos = await storage.getPhotosBySessionId(req.params.sessionId);
      res.json({ photos });
    } catch (error) {
      console.error("Error getting photos:", error);
      res.status(500).json({ message: "Failed to retrieve photos" });
    }
  });

  app.delete("/api/photos/session/:sessionId", async (req: Request, res: Response) => {
    try {
      const success = await storage.deletePhotosBySessionId(req.params.sessionId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting photos:", error);
      res.status(500).json({ message: "Failed to delete photos" });
    }
  });

  // NFT Minting API
  app.post("/api/mint", async (req: Request, res: Response) => {
    try {
      // We'd normally authenticate the user here
      const nftsToMint = req.body.nfts;
      
      if (!Array.isArray(nftsToMint) || nftsToMint.length === 0) {
        return res.status(400).json({ message: "No NFTs to mint" });
      }
      
      const mintedNfts = [];
      
      for (const nftData of nftsToMint) {
        // Generate a random claim token for each NFT
        const claimToken = randomUUID();
        
        // Validate NFT data
        const validNft = insertNftSchema.safeParse({
          userId: nftData.userId,
          imageUrl: nftData.imageUrl,
          message: nftData.message,
          template: nftData.template,
          vibes: nftData.vibes,
          mintAddress: nftData.mintAddress || `mint_${randomUUID().substring(0, 8)}`,
          claimToken,
          claimEmail: nftData.claimEmail,
          metadata: nftData.metadata || {}
        });
        
        if (!validNft.success) {
          return res.status(400).json({ 
            message: "Invalid NFT data", 
            errors: validNft.error.format() 
          });
        }
        
        const nft = await storage.createNft(validNft.data);
        mintedNfts.push(nft);
      }
      
      res.json({ success: true, nfts: mintedNfts });
    } catch (error) {
      console.error("Error minting NFTs:", error);
      res.status(500).json({ message: "Failed to mint NFTs" });
    }
  });

  // NFT Claiming API
  app.post("/api/claim", async (req: Request, res: Response) => {
    try {
      const { token, email } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Claim token is required" });
      }
      
      const nft = await storage.getNftByClaimToken(token);
      
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
      }
      
      if (nft.claimed) {
        return res.status(400).json({ message: "NFT has already been claimed" });
      }
      
      // Update NFT with claim information
      const updatedNft = await storage.updateNft(nft.id, {
        claimed: true,
        claimEmail: email || nft.claimEmail
      });
      
      res.json({ success: true, nft: updatedNft });
    } catch (error) {
      console.error("Error claiming NFT:", error);
      res.status(500).json({ message: "Failed to claim NFT" });
    }
  });

  // Email claim link generation
  app.post("/api/send-claim-email", async (req: Request, res: Response) => {
    try {
      const { nftIds, email } = req.body;
      
      if (!nftIds || !Array.isArray(nftIds) || nftIds.length === 0) {
        return res.status(400).json({ message: "NFT IDs are required" });
      }
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // In a real implementation, we'd send an email here
      // For this example, we'll just update the NFTs with the email
      
      const updatedNfts = [];
      
      for (const id of nftIds) {
        const nft = await storage.getNft(parseInt(id));
        
        if (nft) {
          const updatedNft = await storage.updateNft(nft.id, {
            claimEmail: email
          });
          
          if (updatedNft) {
            updatedNfts.push(updatedNft);
          }
        }
      }
      
      res.json({ 
        success: true, 
        message: `Claim links sent to ${email}`,
        nfts: updatedNfts
      });
    } catch (error) {
      console.error("Error sending claim email:", error);
      res.status(500).json({ message: "Failed to send claim email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

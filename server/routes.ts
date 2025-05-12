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
      
      // Enhance NFTs with collection IDs for UI grouping
      const enhancedNfts = nfts.map(nft => {
        // Generate collection ID based on creation time
        const creationDate = new Date(nft.createdAt);
        const collectionId = `POV-${creationDate.getFullYear()}${String(creationDate.getMonth() + 1).padStart(2, '0')}${String(creationDate.getDate()).padStart(2, '0')}`;
        
        return {
          ...nft,
          collectionId,
          certificateId: nft.certificateId || `POV-${nft.id}-${Date.now().toString().slice(-6)}`
        };
      });
      
      res.json({ nfts: enhancedNfts });
    } catch (error) {
      console.error("Error getting digital collectibles:", error);
      res.status(500).json({ message: "Failed to retrieve digital collectibles" });
    }
  });

  app.get("/api/nfts/:id", async (req: Request, res: Response) => {
    try {
      const nft = await storage.getNft(parseInt(req.params.id));
      if (!nft) {
        return res.status(404).json({ message: "Digital collectible not found" });
      }
      
      // Generate collection ID based on creation time
      // This allows us to group NFTs created in the same batch
      const creationDate = new Date(nft.createdAt);
      const collectionId = `POV-${creationDate.getFullYear()}${String(creationDate.getMonth() + 1).padStart(2, '0')}${String(creationDate.getDate()).padStart(2, '0')}`;
      
      // Enhance NFT with derived fields for UI display
      const enhancedNft = {
        ...nft,
        collectionId,
        certificateId: nft.certificateId || `POV-${nft.id}-${Date.now().toString().slice(-6)}`
      };
      
      res.json({ nft: enhancedNft });
    } catch (error) {
      console.error("Error getting digital collectible:", error);
      res.status(500).json({ message: "Failed to retrieve digital collectible" });
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

  // Digital Collectible Creation API
  app.post("/api/mint", async (req: Request, res: Response) => {
    try {
      // We'd normally authenticate the user here
      const nftsToMint = req.body.nfts;
      
      if (!Array.isArray(nftsToMint) || nftsToMint.length === 0) {
        return res.status(400).json({ message: "No digital collectibles to create" });
      }
      
      const mintedNfts = [];
      const eventDate = new Date().toISOString().split('T')[0];
      
      for (const nftData of nftsToMint) {
        // Generate a random claim token for each collectible
        const claimToken = randomUUID();
        
        // Generate a certificate ID for authenticity
        const certificateId = `POV-${Date.now().toString().slice(-6)}-${randomUUID().substring(0, 4)}`;
        
        // Validate collectible data with event information added
        const validNft = insertNftSchema.safeParse({
          userId: nftData.userId,
          imageUrl: nftData.imageUrl,
          message: nftData.message,
          template: nftData.template,
          vibes: nftData.vibes,
          mintAddress: nftData.mintAddress || `mint_${randomUUID().substring(0, 8)}`,
          claimToken,
          claimEmail: nftData.claimEmail,
          certificateId,
          eventName: "Proof of Vibes",
          eventDate,
          metadata: {
            ...nftData.metadata || {},
            eventInfo: {
              name: "Proof of Vibes",
              date: eventDate,
              type: "Event Memorabilia"
            }
          }
        });
        
        if (!validNft.success) {
          return res.status(400).json({ 
            message: "Invalid digital collectible data", 
            errors: validNft.error.format() 
          });
        }
        
        const nft = await storage.createNft(validNft.data);
        mintedNfts.push(nft);
      }
      
      res.json({ 
        success: true, 
        message: "Your digital collectibles have been created!",
        nfts: mintedNfts 
      });
    } catch (error) {
      console.error("Error creating digital collectibles:", error);
      res.status(500).json({ message: "Failed to create your digital collectibles" });
    }
  });

  // Digital Collectible Claiming API
  app.post("/api/claim", async (req: Request, res: Response) => {
    try {
      const { token, email, recipientName } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Claim token is required" });
      }
      
      const nft = await storage.getNftByClaimToken(token);
      
      if (!nft) {
        return res.status(404).json({ message: "Digital collectible not found" });
      }
      
      if (nft.claimed) {
        return res.status(400).json({ message: "This digital collectible has already been claimed" });
      }
      
      // Generate a unique certificate ID if not already present
      const certificateId = `POV-${nft.id}-${Date.now().toString().slice(-6)}`;
      const eventDate = new Date().toISOString().split('T')[0];
      
      // Update NFT with claim information
      const updatedNft = await storage.updateNft(nft.id, {
        claimed: true,
        claimEmail: email || nft.claimEmail,
        claimedAt: new Date(),
        recipientName: recipientName || "Event Attendee",
        certificateId,
        eventDate,
        eventName: "Proof of Vibes"
      });
      
      res.json({ 
        success: true, 
        message: "Your Proof of Vibes collectible has been claimed successfully!",
        nft: updatedNft
      });
    } catch (error) {
      console.error("Error claiming digital collectible:", error);
      res.status(500).json({ message: "Failed to claim your digital collectible" });
    }
  });
  
  // Enhanced Claiming API with certification
  app.post("/api/claim-collectible", async (req: Request, res: Response) => {
    try {
      const { claimToken, email, recipientName } = req.body;
      
      if (!claimToken) {
        return res.status(400).json({ message: "Claim token is required" });
      }
      
      const nft = await storage.getNftByClaimToken(claimToken);
      
      if (!nft) {
        return res.status(404).json({ message: "Digital collectible not found" });
      }
      
      if (nft.claimed) {
        return res.status(400).json({ 
          message: "This digital collectible has already been claimed"
        });
      }
      
      // Generate event-specific certificate ID
      const certificateId = `POV-${nft.id}-${Date.now().toString().slice(-6)}`;
      const eventDate = new Date().toISOString().split('T')[0];
      
      // Update NFT with claiming and event information
      const updatedNft = await storage.updateNft(nft.id, { 
        claimed: true,
        claimedAt: new Date(),
        claimEmail: email || nft.claimEmail,
        recipientName: recipientName || "Event Attendee",
        certificateId,
        eventDate,
        eventName: "Proof of Vibes"
      });
      
      return res.json({ 
        success: true, 
        message: "Your exclusive digital collectible has been claimed!",
        nft: updatedNft 
      });
    } catch (error) {
      console.error("Error claiming collectible:", error);
      return res.status(500).json({ message: "Failed to claim your digital collectible" });
    }
  });

  // Email claim link generation and copy creation
  app.post("/api/send-claim-email", async (req: Request, res: Response) => {
    try {
      const { nftIds, recipients = [], copyCount = 1 } = req.body;
      
      if (!nftIds || !Array.isArray(nftIds) || nftIds.length === 0) {
        return res.status(400).json({ message: "Digital collectible IDs are required" });
      }
      
      // Ensure copy count is valid
      const numCopies = parseInt(copyCount.toString());
      if (isNaN(numCopies) || numCopies < 1 || numCopies > 50) {
        return res.status(400).json({ message: "Copy count must be between 1 and 50" });
      }
      
      // In a photobooth environment, email might be optional
      // We'll create the copies regardless of whether there are recipients
      
      const allUpdatedNfts = [];
      const eventDate = new Date().toISOString().split('T')[0];
      const timestamp = Date.now().toString().slice(-6);
      const collectionId = `group-${timestamp}`; // Use the same collection ID for all copies
      
      // For each original NFT
      for (const id of nftIds) {
        const originalNft = await storage.getNft(parseInt(id));
        
        if (!originalNft) continue;
        
        // First, update the original NFT with collection ID (and recipient info if available)
        if (allUpdatedNfts.length === 0) {
          // Generate a certificate ID for this collectible
          const certificateId = originalNft.certificateId || 
            `POV-${originalNft.id}-${timestamp}`;
          
          // Prepare update object
          const updateData: any = {
            certificateId,
            eventDate,
            eventName: "Proof of Vibes",
            collectionId // Use the same collection ID for all NFTs in this group
          };
          
          // Add recipient data if available
          if (recipients.length > 0 && recipients[0].email) {
            updateData.claimEmail = recipients[0].email;
            updateData.recipientName = recipients[0].name || "Event Attendee";
          }
          
          // Update the original NFT
          const updatedNft = await storage.updateNft(originalNft.id, updateData);
          
          if (updatedNft) {
            allUpdatedNfts.push(updatedNft);
          }
        }
        
        // Create additional copies (numCopies - 1 since we already updated the original)
        for (let i = 1; i < numCopies; i++) {
          // Generate unique IDs for copies
          const newId = Date.now() + Math.floor(Math.random() * 1000) + i;
          const certificateId = `POV-${newId}-${timestamp}`;
          
          // Prepare NFT data
          const nftData: any = {
            userId: originalNft.userId,
            imageUrl: originalNft.imageUrl,
            message: originalNft.message,
            template: originalNft.template,
            vibes: originalNft.vibes,
            certificateId,
            eventDate,
            collectionId, // Use the same collection ID for all NFTs in this group
            eventName: "Proof of Vibes"
          };
          
          // If there's a recipient for this copy, attach their info
          if (recipients.length > i && recipients[i].email) {
            nftData.claimEmail = recipients[i].email;
            nftData.recipientName = recipients[i].name || "Event Attendee";
          }
          
          // Create the copy
          const newNft = await storage.createNft(nftData);
          allUpdatedNfts.push(newNft);
        }
      }
      
      // Build appropriate success message
      let message;
      if (recipients.length > 0) {
        const emailAddresses = recipients
          .filter(r => r.email)
          .map(r => r.email)
          .join(', ');
        
        message = emailAddresses
          ? `Your Proof of Vibes collectibles have been sent to ${emailAddresses}`
          : `Your ${numCopies} Proof of Vibes collectibles have been created`;
      } else {
        message = `Your ${numCopies} Proof of Vibes collectibles have been created`;
      }
      
      res.json({ 
        success: true, 
        message,
        nfts: allUpdatedNfts
      });
    } catch (error) {
      console.error("Error creating digital collectibles:", error);
      res.status(500).json({ message: "Failed to create your digital collectibles" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

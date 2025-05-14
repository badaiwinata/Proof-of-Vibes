import { 
  users, type User, type InsertUser,
  nfts, type Nft, type InsertNft,
  photos, type Photo, type InsertPhoto
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // NFT methods
  getNft(id: number): Promise<Nft | undefined>;
  getNftsByUserId(userId: number): Promise<Nft[]>;
  getAllNfts(limit?: number, offset?: number): Promise<Nft[]>;
  createNft(nft: InsertNft): Promise<Nft>;
  updateNft(id: number, updates: Partial<InsertNft>): Promise<Nft | undefined>;
  getNftByClaimToken(token: string): Promise<Nft | undefined>;
  
  // Photo methods
  getPhoto(id: number): Promise<Photo | undefined>;
  getPhotosBySessionId(sessionId: string): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;
  deletePhotosBySessionId(sessionId: string): Promise<boolean>;
  
  // Admin functions
  resetUserGeneratedData(): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private nfts: Map<number, Nft>;
  private photos: Map<number, Photo>;
  private userIdCounter: number;
  private nftIdCounter: number;
  private photoIdCounter: number;

  constructor() {
    this.users = new Map();
    this.nfts = new Map();
    this.photos = new Map();
    this.userIdCounter = 1;
    this.nftIdCounter = 1;
    this.photoIdCounter = 1;
    
    // Add some sample NFTs for the gallery view
    this.seedSampleNFTs();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      solanaWallet: insertUser.solanaWallet || null
    };
    this.users.set(id, user);
    return user;
  }

  // NFT methods
  async getNft(id: number): Promise<Nft | undefined> {
    return this.nfts.get(id);
  }

  async getNftsByUserId(userId: number): Promise<Nft[]> {
    return Array.from(this.nfts.values()).filter(
      (nft) => nft.userId === userId
    );
  }

  async getAllNfts(limit = 100, offset = 0): Promise<Nft[]> {
    const allNfts = Array.from(this.nfts.values())
      .sort((a, b) => {
        // Sort by creation date, newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    return allNfts.slice(offset, offset + limit);
  }

  async createNft(insertNft: InsertNft): Promise<Nft> {
    const id = this.nftIdCounter++;
    const now = new Date();
    const claimToken = insertNft.claimToken || uuidv4();
    
    const nft: Nft = { 
      ...insertNft, 
      id, 
      userId: insertNft.userId || null,
      message: insertNft.message || null,
      imageUrl: insertNft.imageUrl,
      template: insertNft.template,
      vibes: insertNft.vibes,
      mintAddress: insertNft.mintAddress || null,
      claimed: insertNft.claimed === true || false,
      claimToken: claimToken,
      claimEmail: insertNft.claimEmail || null,
      claimedAt: insertNft.claimedAt || null,
      recipientName: insertNft.recipientName || null,
      eventName: insertNft.eventName || "Proof of Vibes",
      eventDate: insertNft.eventDate || null,
      certificateId: insertNft.certificateId || null,
      collectionId: insertNft.collectionId || null,
      createdAt: now,
      metadata: insertNft.metadata || null
    };
    
    this.nfts.set(id, nft);
    return nft;
  }

  async updateNft(id: number, updates: Partial<InsertNft>): Promise<Nft | undefined> {
    const nft = this.nfts.get(id);
    if (!nft) return undefined;
    
    const updatedNft = { ...nft, ...updates };
    this.nfts.set(id, updatedNft);
    return updatedNft;
  }

  async getNftByClaimToken(token: string): Promise<Nft | undefined> {
    return Array.from(this.nfts.values()).find(
      (nft) => nft.claimToken === token
    );
  }

  // Photo methods
  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async getPhotosBySessionId(sessionId: string): Promise<Photo[]> {
    return Array.from(this.photos.values()).filter(
      (photo) => photo.sessionId === sessionId
    );
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.photoIdCounter++;
    const now = new Date();
    
    const photo: Photo = { 
      id,
      userId: insertPhoto.userId || null,
      sessionId: insertPhoto.sessionId,
      imageData: insertPhoto.imageData,
      createdAt: now
    };
    
    this.photos.set(id, photo);
    return photo;
  }

  async deletePhoto(id: number): Promise<boolean> {
    return this.photos.delete(id);
  }

  async deletePhotosBySessionId(sessionId: string): Promise<boolean> {
    const sessionPhotos = await this.getPhotosBySessionId(sessionId);
    sessionPhotos.forEach(photo => {
      this.photos.delete(photo.id);
    });
    return true;
  }
  
  // Reset all user-generated data but keep sample data
  async resetUserGeneratedData(): Promise<boolean> {
    try {
      // Store initial sample NFT count to know which are demo NFTs
      const sampleNftCount = 9; // We have 9 sample NFTs
      
      // Delete user-generated NFTs (keep only the sample ones)
      const userNfts = [...this.nfts.values()].filter(nft => nft.id > sampleNftCount);
      for (const nft of userNfts) {
        this.nfts.delete(nft.id);
      }
      
      // Reset the NFT ID counter to avoid ID conflicts
      this.nftIdCounter = sampleNftCount + 1;
      
      // Clear all session photos
      this.photos.clear();
      this.photoIdCounter = 1;
      
      console.log("Reset complete: all user-generated data has been cleared");
      return true;
    } catch (error) {
      console.error("Error resetting user data:", error);
      return false;
    }
  }

  // Seed some sample NFTs for gallery view
  private seedSampleNFTs() {
    const templates = ['classic', 'neon', 'retro', 'minimal'];
    const messages = [
      "Best night ever!", 
      "Squad goals achieved!", 
      "Mind = blown!", 
      "Neon dreams!",
      "Epic adventure!",
      "Memories made!",
      "VIP experience!",
      "Dance all night!",
      "Forever vibes!"
    ];
    const vibeTags = [
      ['excited', 'music'], 
      ['friends', 'memories'], 
      ['tech', 'future'], 
      ['glow', 'party'],
      ['adventure', 'experience'],
      ['celebration', 'fun'],
      ['vip', 'exclusive'],
      ['dance', 'nightlife'],
      ['forever', 'moments']
    ];
    const imageUrls = [
      'https://images.unsplash.com/photo-1601288496920-b6154fe3626a',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
      'https://images.unsplash.com/photo-1617802690992-15d93263d3a9',
      'https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
      'https://images.unsplash.com/photo-1496024840928-4c417adf211d',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819'
    ];
    
    // Create a sample user if needed
    const userId = this.userIdCounter++;
    const user: User = { 
      id: userId,
      username: "event_visitor",
      password: "hashed_password",
      email: null,
      solanaWallet: null
    };
    this.users.set(userId, user);
    
    // Create sample NFTs
    for (let i = 0; i < 9; i++) {
      const id = this.nftIdCounter++;
      // Generate random times for the NFTs (5-120 minutes ago)
      const minutesAgo = Math.floor(5 + Math.random() * 115);
      const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000);
      
      // Add collection grouping - every 3 NFTs belong to the same collection
      const collectionId = `event-${Math.floor(i/3) + 1}`;
      
      const nft: Nft = {
        id,
        userId,
        imageUrl: imageUrls[i],
        message: messages[i],
        template: templates[i % templates.length],
        vibes: vibeTags[i],
        claimed: i % 3 === 0, // Make every third NFT claimed
        claimToken: uuidv4(),
        createdAt,
        mintAddress: `sample${i}MintAddress`,
        collectionId: collectionId,
        eventName: i < 3 ? "VIP Night" : i < 6 ? "Tech Conference" : "Music Festival",
        claimEmail: null,
        claimedAt: i % 3 === 0 ? new Date(Date.now() - Math.floor(Math.random() * 60) * 60 * 1000) : null,
        recipientName: i % 3 === 0 ? "Event Attendee" : null,
        eventDate: new Date().toLocaleDateString(),
        certificateId: `POV-${id}-${Date.now().toString().slice(-6)}`,
        metadata: null
      };
      
      this.nfts.set(id, nft);
    }
  }
}

export const storage = new MemStorage();

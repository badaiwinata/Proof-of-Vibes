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
    const user: User = { ...insertUser, id };
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
      claimed: false,
      claimToken,
      createdAt: now
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
      ...insertPhoto, 
      id,
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

  // Seed some sample NFTs for gallery view
  private seedSampleNFTs() {
    const templates = ['classic', 'neon', 'retro', 'minimal'];
    const messages = [
      "Best night ever!", 
      "Squad goals achieved!", 
      "Mind = blown!", 
      "Neon dreams!"
    ];
    const vibeTags = [
      ['excited', 'music'], 
      ['friends', 'memories'], 
      ['tech', 'future'], 
      ['glow', 'party']
    ];
    const imageUrls = [
      'https://images.unsplash.com/photo-1601288496920-b6154fe3626a',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
      'https://images.unsplash.com/photo-1617802690992-15d93263d3a9',
      'https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9'
    ];
    
    // Create a sample user if needed
    const userId = this.userIdCounter++;
    const user: User = { 
      id: userId,
      username: "event_visitor",
      password: "hashed_password"
    };
    this.users.set(userId, user);
    
    // Create sample NFTs
    for (let i = 0; i < 4; i++) {
      const id = this.nftIdCounter++;
      const minutesAgo = [10, 25, 42, 60][i];
      const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000);
      
      const nft: Nft = {
        id,
        userId,
        imageUrl: imageUrls[i],
        message: messages[i],
        template: templates[i % templates.length],
        vibes: vibeTags[i],
        claimed: false,
        claimToken: uuidv4(),
        createdAt,
        mintAddress: `sample${i}MintAddress`
      };
      
      this.nfts.set(id, nft);
    }
  }
}

export const storage = new MemStorage();

import * as web3 from '@solana/web3.js';
import * as token from '@solana/spl-token';
import * as metaplex from '@metaplex-foundation/js';
import Pinata from '@pinata/sdk';
import { v4 as uuidv4 } from 'uuid';

// Connection to devnet
const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');

// Pinata for IPFS storage
let pinata: Pinata | null = null;

// Initialize Pinata with API keys
export const initializePinata = (apiKey: string, apiSecret: string) => {
  pinata = new Pinata({ pinataApiKey: apiKey, pinataSecretApiKey: apiSecret });
  return pinata;
};

// Get or create a keypair for the photobooth wallet
let photobooth_keypair: web3.Keypair | null = null;

export const getPhotoboothWallet = async (): Promise<web3.Keypair> => {
  if (!photobooth_keypair) {
    // In production, you'd want to securely store and retrieve the keypair
    // For demo purposes, we'll generate a new one
    photobooth_keypair = web3.Keypair.generate();
    
    // Fund the wallet from an airdrop on devnet
    try {
      const airdropSignature = await connection.requestAirdrop(
        photobooth_keypair.publicKey,
        web3.LAMPORTS_PER_SOL * 2
      );
      await connection.confirmTransaction(airdropSignature);
      console.log('Wallet funded with 2 SOL on devnet');
    } catch (error) {
      console.error('Error funding wallet:', error);
    }
  }
  return photobooth_keypair;
};

// Upload metadata to IPFS
export const uploadToIPFS = async (
  imageData: string, 
  name: string, 
  description: string, 
  attributes: Array<{ trait_type: string, value: string }>
): Promise<string | null> => {
  if (!pinata) {
    console.error('Pinata not initialized');
    return null;
  }

  try {
    // Convert base64 to buffer for IPFS
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    
    // Pin image to IPFS
    const imageCid = await pinata.pinFileToIPFS(imageBuffer, {
      pinataMetadata: {
        name: `photobooth-image-${uuidv4()}`
      }
    });
    
    // Create and pin metadata
    const metadata = {
      name,
      description,
      image: `ipfs://${imageCid.IpfsHash}`,
      attributes
    };
    
    const metadataCid = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: `photobooth-metadata-${uuidv4()}`
      }
    });
    
    return metadataCid.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return null;
  }
};

// Lazy minting: Store NFT details to be minted later
export interface LazyNFT {
  metadataUri: string;
  recipientEmail?: string;
  claimToken: string;
  name: string;
  description: string;
  edition?: number;
  totalEditions?: number;
  mintedAt?: Date;
  mintTxId?: string;
}

// Store to be minted NFTs
const lazyNFTs: Map<string, LazyNFT> = new Map();

// Create a lazy NFT (not minted yet)
export const createLazyNFT = async (
  imageData: string,
  name: string,
  description: string,
  attributes: Array<{ trait_type: string, value: string }>,
  edition?: number,
  totalEditions?: number
): Promise<LazyNFT | null> => {
  try {
    // Upload metadata to IPFS
    const metadataUri = await uploadToIPFS(imageData, name, description, attributes);
    
    if (!metadataUri) {
      return null;
    }
    
    // Generate a claim token
    const claimToken = uuidv4();
    
    // Create the lazy NFT
    const lazyNFT: LazyNFT = {
      metadataUri,
      claimToken,
      name,
      description,
      edition,
      totalEditions,
      mintedAt: new Date()
    };
    
    // Store the lazy NFT
    lazyNFTs.set(claimToken, lazyNFT);
    
    return lazyNFT;
  } catch (error) {
    console.error('Error creating lazy NFT:', error);
    return null;
  }
};

// Mint an NFT when claimed
export const mintNFT = async (
  claimToken: string, 
  recipientAddress: string
): Promise<string | null> => {
  try {
    const lazyNFT = lazyNFTs.get(claimToken);
    
    if (!lazyNFT) {
      console.error('NFT not found for claim token:', claimToken);
      return null;
    }
    
    // Get the photobooth wallet
    const photoboothWallet = await getPhotoboothWallet();
    
    // Initialize Metaplex
    const mx = new metaplex.Metaplex(connection);
    mx.use(metaplex.keypairIdentity(photoboothWallet));
    
    // Create NFT
    const { nft } = await mx.nfts().create({
      uri: `https://gateway.pinata.cloud/ipfs/${lazyNFT.metadataUri}`,
      name: lazyNFT.name,
      sellerFeeBasisPoints: 0, // 0% royalties for free NFTs
      maxSupply: lazyNFT.totalEditions ? metaplex.toBigNumber(lazyNFT.totalEditions) : undefined,
    });
    
    // Transfer NFT to recipient
    const recipientPublicKey = new web3.PublicKey(recipientAddress);
    
    // If recipient is different from minter, transfer the NFT
    if (!photoboothWallet.publicKey.equals(recipientPublicKey)) {
      await mx.nfts().transfer({
        nftOrSft: nft,
        authority: photoboothWallet,
        toOwner: recipientPublicKey,
      });
    }
    
    // Update the lazy NFT with transaction ID
    lazyNFT.mintTxId = nft.mintAddress.toString();
    lazyNFTs.set(claimToken, lazyNFT);
    
    return nft.mintAddress.toString();
  } catch (error) {
    console.error('Error minting NFT:', error);
    return null;
  }
};

// Get NFT status by claim token
export const getNFTStatus = (claimToken: string): LazyNFT | null => {
  return lazyNFTs.get(claimToken) || null;
};

// Create a batch of NFTs (for multiple editions)
export const createBatchLazyNFTs = async (
  imageData: string,
  name: string,
  description: string,
  attributes: Array<{ trait_type: string, value: string }>,
  editionCount: number
): Promise<LazyNFT[]> => {
  const result: LazyNFT[] = [];
  
  for (let i = 1; i <= editionCount; i++) {
    const editionName = `${name} - Edition ${i} of ${editionCount}`;
    const lazyNFT = await createLazyNFT(
      imageData, 
      editionName,
      description,
      [...attributes, { trait_type: 'Edition', value: `${i} of ${editionCount}` }],
      i,
      editionCount
    );
    
    if (lazyNFT) {
      result.push(lazyNFT);
    }
  }
  
  return result;
};
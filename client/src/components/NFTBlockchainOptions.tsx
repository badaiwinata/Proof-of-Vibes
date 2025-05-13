import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSolana } from '../context/SolanaContext';
import { apiRequest } from '../lib/queryClient';
import { Nft } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface NFTBlockchainOptionsProps {
  nft: Nft;
  onNftUpdated?: (updatedNft: Nft) => void;
}

export default function NFTBlockchainOptions({ nft, onNftUpdated }: NFTBlockchainOptionsProps) {
  const [customWalletAddress, setCustomWalletAddress] = useState<string>('');
  const [mintInProgress, setMintInProgress] = useState<boolean>(false);
  
  const { walletAddress, simulateWalletConnection, devnetEnabled } = useSolana();
  const { toast } = useToast();
  
  // Safely check blockchain status with proper type casting
  const blockchainData = nft.metadata && typeof nft.metadata === 'object' ? 
    (nft.metadata as any).blockchain || {} : {};
  const isMinted = blockchainData.status === 'minted';
  const isPending = blockchainData.status === 'pending';
  const certificateId = nft.certificateId || `POV-${nft.id}`;
  const editionInfo = nft.editionNumber && nft.editionCount && nft.editionCount > 1 
    ? ` - Edition ${nft.editionNumber} of ${nft.editionCount}` 
    : '';
  
  // Handle claiming the NFT with a wallet address
  const handleMintToWallet = async (address: string) => {
    if (!address) {
      toast({
        title: "Wallet address required",
        description: "Please enter a valid Solana wallet address.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setMintInProgress(true);
      
      // Call the claim API with the wallet address
      const response = await apiRequest<{success: boolean; nft: Nft; message: string}>('/api/claim', {
        method: 'POST',
        body: JSON.stringify({
          token: nft.claimToken,
          walletAddress: address,
        }),
      });
      
      if (response && response.success && response.nft) {
        toast({
          title: "NFT Minted!",
          description: `Your collectible has been minted to your wallet on Solana devnet.`,
        });
        
        // Update the parent component with the updated NFT
        if (onNftUpdated) {
          onNftUpdated(response.nft);
        }
      } else {
        throw new Error((response && response.message) || 'Failed to mint NFT');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast({
        title: "Minting Failed",
        description: `There was an error minting your collectible: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setMintInProgress(false);
    }
  };
  
  // Generate random wallet and mint
  const handleRandomWallet = async () => {
    const address = simulateWalletConnection();
    await handleMintToWallet(address);
  };
  
  // Connect to a custom wallet
  const handleConnectCustomWallet = async () => {
    await handleMintToWallet(customWalletAddress);
  };
  
  if (!devnetEnabled) {
    return null;
  }
  
  if (isMinted) {
    // Display minted status and blockchain info
    const mintAddress = nft.mintAddress && typeof nft.mintAddress === 'string' && nft.mintAddress.startsWith('solana:') 
      ? nft.mintAddress.replace('solana:', '') 
      : nft.mintAddress;
      
    return (
      <Card className="mt-4 bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700/40">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-green-400">Blockchain Status</h3>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-600/30 text-green-300">Minted</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-white/80">Network:</span> 
              <span className="ml-2 text-green-400">Solana Devnet</span>
            </div>
            {blockchainData && blockchainData.mintedAt && (
              <div>
                <span className="font-medium text-white/80">Minted:</span> 
                <span className="ml-2 text-green-400">
                  {new Date(blockchainData.mintedAt).toLocaleString()}
                </span>
              </div>
            )}
            {mintAddress && (
              <div>
                <span className="font-medium text-white/80">Address:</span> 
                <span className="ml-2 text-green-400 text-xs break-all">
                  {mintAddress}
                </span>
              </div>
            )}
            {blockchainData && blockchainData.recipientWallet && (
              <div>
                <span className="font-medium text-white/80">Owner:</span> 
                <span className="ml-2 text-green-400 text-xs break-all">
                  {blockchainData.recipientWallet}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Display pending status with minting options
  return (
    <Card className="mt-4 bg-gradient-to-br from-indigo-900/20 to-purple-800/10 border-indigo-700/40">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-indigo-400">Blockchain Status</h3>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-600/30 text-indigo-300">
            {isPending ? 'Ready to Mint' : 'Not Minted'}
          </span>
        </div>
        
        <Alert className="mb-4 bg-indigo-950/40 border-indigo-800/50">
          <AlertDescription>
            This collectible can be minted to the Solana blockchain (devnet).
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Mint with Generated Wallet</h4>
            <Button 
              onClick={handleRandomWallet}
              disabled={mintInProgress}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {mintInProgress ? 'Minting...' : 'Generate Wallet & Mint'}
            </Button>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Use Custom Wallet Address</h4>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter Solana wallet address"
                value={customWalletAddress}
                onChange={(e) => setCustomWalletAddress(e.target.value)}
                className="bg-indigo-950/30 border-indigo-700/50"
              />
              <Button 
                onClick={handleConnectCustomWallet}
                disabled={mintInProgress || !customWalletAddress}
                variant="outline"
                className="shrink-0 border-indigo-600 text-indigo-400 hover:bg-indigo-800/30"
              >
                Mint
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
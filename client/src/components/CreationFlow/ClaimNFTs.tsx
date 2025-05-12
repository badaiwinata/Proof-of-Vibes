import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCreationContext } from '@/context/CreationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { QRCode } from 'react-qrcode-logo';
import { Check, Eye, Sparkles, Share2 } from 'lucide-react';
import { Link } from 'wouter';
import NFTPreviewModal from '@/components/NFTPreviewModal';

interface ClaimNFTsProps {
  onFinish: () => void;
}

export default function ClaimNFTs({ onFinish }: ClaimNFTsProps) {
  const { mintedNfts } = useCreationContext();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailConfirmation, setEmailConfirmation] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [previewNft, setPreviewNft] = useState<number | null>(null);
  const { toast } = useToast();

  const sendClaimEmailMutation = useMutation({
    mutationFn: async () => {
      console.log("Send claim email mutation started with NFTs:", mintedNfts);
      
      // Prepare NFT IDs to claim
      const nftIdsToSend = mintedNfts.map(nft => nft.id);
      console.log("NFT IDs to claim:", nftIdsToSend, "Email:", email);
      
      const response = await apiRequest('POST', '/api/send-claim-email', { 
        nftIds: nftIdsToSend,
        email
      });
      
      const data = await response.json();
      console.log("API response:", response);
      console.log("JSON response data:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Mutation successful with data:", data);
      setEmailSent(true);
      setEmailConfirmation(email);
      toast({
        title: "Success!",
        description: `We've sent your Proof of Vibes to ${email}.`,
      });
    },
    onError: (error) => {
      console.log("Mutation error:", error);
      toast({
        title: "Failed to send",
        description: "There was an error sending your collectibles. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendEmail = () => {
    console.log("Send email button clicked with email:", email);
    
    // Validate email format
    if (!email) {
      setEmailError('Email is required');
      toast({
        title: "Email required",
        description: "Please enter your email address to receive your collectibles",
        variant: "destructive",
      });
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Clear any errors and send
    setEmailError(null);
    console.log("Calling send claim email mutation");
    sendClaimEmailMutation.mutate();
  };

  const generateClaimUrl = () => {
    // In a real app, this would be a real claim link with token
    const claimToken = mintedNfts[0]?.claimToken || 'sample-token';
    return `${window.location.origin}/claim/${claimToken}`;
  };

  const handleDownloadQR = () => {
    const qrCanvas = document.getElementById('claim-qr-code')?.querySelector('canvas');
    if (qrCanvas) {
      const url = qrCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'proof-of-vibes-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderEmailSection = () => {
    if (emailSent) {
      return (
        <div className="space-y-3">
          <p className="text-sm">
            We've sent your digital collectibles to{' '}
            <span className="font-medium text-white">{emailConfirmation}</span>
          </p>
          <p className="text-sm text-white/70">
            Check your email and follow the instructions to view and share your Proof of Vibes.
          </p>
          <Button 
            className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full font-medium text-white transition-colors"
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
          >
            Send to another email
          </Button>
        </div>
      );
    }
    
    return (
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              const newEmail = e.target.value;
              setEmail(newEmail);
              
              // Validate email format when there's input
              if (newEmail && !/^\S+@\S+\.\S+$/.test(newEmail)) {
                setEmailError('Please enter a valid email address');
              } else {
                setEmailError(null);
              }
            }}
            placeholder="your@email.com"
            className={`w-full px-4 py-2 bg-[#1A1A2E] border ${
              emailError ? 'border-red-500' : 'border-white/20'
            } rounded-lg focus:outline-none focus:ring-2 ${
              emailError ? 'focus:ring-red-500' : 'focus:ring-primary'
            }`}
          />
          {emailError && (
            <p className="mt-2 text-sm text-red-500">{emailError}</p>
          )}
        </div>
        
        <Button 
          className={`w-full px-4 py-2 rounded-full font-bold text-white transition-colors ${
            emailError || !email
              ? 'bg-primary/50 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90'
          }`}
          onClick={handleSendEmail}
          disabled={!!emailError || !email || sendClaimEmailMutation.isPending}
        >
          {sendClaimEmailMutation.isPending ? 'Sending...' : 'Send to My Email'}
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className="step-content">
        <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
          <h2 className="font-heading text-2xl font-bold mb-4 text-center">
            Get Your Proof of Vibes
          </h2>
          <p className="text-center mb-6 text-white/70">
            Your digital collectibles are ready! Choose how you want to receive them
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Claim via Email */}
            <div className={`p-4 rounded-lg border ${emailSent ? 'border-green-500 bg-green-500/10' : 'border-white/20 bg-[#1A1A2E]'}`}>
              <h3 className="font-heading text-lg font-medium mb-3">
                {emailSent ? (
                  <div className="flex items-center gap-2">
                    <Check className="text-green-500" />
                    Email Sent
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Share2 className="text-accent" />
                    Get via Email
                  </div>
                )}
              </h3>
              
              {renderEmailSection()}
            </div>
            
            {/* Claim via QR Code */}
            <div className="p-4 rounded-lg border border-white/20 bg-[#1A1A2E]">
              <h3 className="font-heading text-lg font-medium mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-accent" />
                  Get via QR Code
                </div>
              </h3>
              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-md mb-3" id="claim-qr-code">
                  <QRCode 
                    value={generateClaimUrl()} 
                    size={150}
                    bgColor={"#FFFFFF"}
                    fgColor={"#000000"}
                    logoImage=""
                    removeQrCodeBehindLogo={true}
                    qrStyle="dots"
                  />
                </div>
                <p className="text-sm text-center text-white/70 mb-3">
                  Scan this QR code to view your digital collectibles on your phone
                </p>
                <Button 
                  variant="outline"
                  className="w-full px-4 py-2 border border-white/20 hover:bg-white/10 rounded-full font-medium text-white transition-colors"
                  onClick={handleDownloadQR}
                >
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>
          
          {/* Collection Preview */}
          <div className="mt-8 mb-6">
            <h4 className="font-heading text-lg font-medium mb-3">Your Digital Collectibles</h4>
            <div className="flex overflow-x-auto pb-4 space-x-3">
              {mintedNfts.map((nft, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-32 aspect-[3/4] rounded-lg overflow-hidden relative group cursor-pointer"
                  onClick={() => setPreviewNft(index)}
                >
                  <img 
                    src={nft.imageUrl} 
                    alt={`Digital Collectible ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
            <Link href="/">
              <Button 
                variant="outline"
                className="px-6 py-3 border border-white/30 hover:bg-white/10 rounded-full font-medium text-white transition-colors"
              >
                View All Collectibles
              </Button>
            </Link>
            <Button 
              className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-full font-bold text-white transition-colors"
              onClick={onFinish}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
      
      {previewNft !== null && mintedNfts && mintedNfts.length > previewNft && (
        <NFTPreviewModal
          nft={mintedNfts[previewNft]}
          isOpen={true}
          onClose={() => setPreviewNft(null)}
        />
      )}
    </>
  );
}
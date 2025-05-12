import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCreationContext } from '@/context/CreationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { QRCode } from 'react-qrcode-logo';
import { Check } from 'lucide-react';
import { Link } from 'wouter';

interface ClaimNFTsProps {
  onFinish: () => void;
}

export default function ClaimNFTs({ onFinish }: ClaimNFTsProps) {
  const { mintedNfts } = useCreationContext();
  const [email, setEmail] = useState('');
  // Reset emailSent to false to ensure clean state
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailConfirmation, setEmailConfirmation] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const { toast } = useToast();

  const sendClaimEmailMutation = useMutation({
    mutationFn: async () => {
      console.log("Send claim email mutation started with NFTs:", mintedNfts);
      const nftIds = mintedNfts.map(nft => nft.id);
      console.log("NFT IDs to claim:", nftIds, "Email:", email);
      const response = await apiRequest('POST', '/api/send-claim-email', { nftIds, email });
      console.log("API response:", response);
      
      const jsonData = await response.json();
      console.log("JSON response data:", jsonData);
      return jsonData;
    },
    onSuccess: (data) => {
      console.log("Mutation successful with data:", data);
      // Store the email we sent to
      setEmailConfirmation(email);
      // Set email sent flag
      setEmailSent(true);
      
      toast({
        title: "Email sent",
        description: `Claim link sent to ${email}`,
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error sending email",
        description: error.message || "Failed to send claim email. Please try again.",
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
        description: "Please enter your email address",
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
    // This is a simple example - in production you'd use a proper QR library with download capability
    const canvas = document.getElementById('claim-qr-code')?.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'proof-of-vibes-claim.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="step-content">
      <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
        <h2 className="font-heading text-2xl font-bold mb-4 text-center">Claim Your NFTs</h2>
        <p className="text-center mb-6 text-white/70">Your NFTs have been minted successfully! Claim them now.</p>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <Check className="text-green-500 w-12 h-12" />
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">Minting Complete!</h3>
          <p className="text-center text-white/70 max-w-md">Your {mintedNfts.length} NFTs have been successfully minted on the Solana blockchain.</p>
        </div>
        
        {/* Claim Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email Claim */}
          <div className="glassmorphism rounded-xl p-4">
            <h4 className="font-heading text-lg font-medium mb-3">Claim via Email</h4>
            <p className="text-sm text-white/70 mb-4">We'll send you a link to claim your NFTs directly to your email.</p>
            
            {emailConfirmation ? (
              // Confirmed email sent UI
              <div className="flex flex-col items-center justify-center py-4 bg-[#1A1A2E]/50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                  <Check className="text-green-500 w-6 h-6" />
                </div>
                <p className="text-green-400 font-medium mb-1">Email Sent!</p>
                <p className="text-sm text-white/70 text-center mb-2">
                  Claim link has been sent to:
                </p>
                <p className="font-medium text-white mb-3">{emailConfirmation}</p>
                <Button
                  variant="outline"
                  className="px-4 py-2 border border-white/20 hover:bg-white/10 rounded-full text-sm"
                  onClick={() => {
                    setEmailConfirmation(null);
                    setEmailSent(false);
                  }}
                >
                  Send to another email
                </Button>
              </div>
            ) : (
              // Email input UI
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
                  {sendClaimEmailMutation.isPending ? 'Sending...' : 'Send Claim Link'}
                </Button>
              </div>
            )}
          </div>
          
          {/* QR Code Claim */}
          <div className="glassmorphism rounded-xl p-4">
            <h4 className="font-heading text-lg font-medium mb-3">Claim via QR Code</h4>
            <p className="text-sm text-white/70 mb-4">Scan this QR code with your phone to claim your NFTs instantly.</p>
            
            <div className="flex justify-center mb-4" id="claim-qr-code">
              <div className="w-40 h-40 bg-white p-2 rounded-lg">
                <QRCode
                  value={generateClaimUrl()}
                  size={152}
                  qrStyle="dots"
                  eyeRadius={8}
                  bgColor="#ffffff"
                  fgColor="#1A1A2E"
                />
              </div>
            </div>
            
            <Button 
              variant="outline"
              className="w-full px-4 py-2 border border-white/20 hover:bg-white/10 rounded-full font-medium text-white transition-colors"
              onClick={handleDownloadQR}
            >
              Download QR Code
            </Button>
          </div>
        </div>
        
        {/* Collection Preview */}
        <div className="mb-6">
          <h4 className="font-heading text-lg font-medium mb-3">Your NFT Collection</h4>
          <div className="flex overflow-x-auto pb-4 space-x-3">
            {mintedNfts.map((nft, index) => (
              <div key={index} className="flex-shrink-0 w-32 aspect-[3/4] rounded-lg overflow-hidden">
                <img 
                  src={nft.imageUrl} 
                  alt={`Minted NFT ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />
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
              View in Gallery
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
  );
}

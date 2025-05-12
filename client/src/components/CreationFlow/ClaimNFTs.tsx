import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCreationContext } from '@/context/CreationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { QRCode } from 'react-qrcode-logo';
import { Check, Eye, Sparkles, Share2, Award, Mail, QrCode, SmartphoneNfc, Plus, X, Users } from 'lucide-react';
import { Link } from 'wouter';
import NFTPreviewModal from '@/components/NFTPreviewModal';
import { Badge } from '@/components/ui/badge';

interface ClaimNFTsProps {
  onFinish: () => void;
}

interface Recipient {
  name: string;
  email: string;
  error?: string;
}

export default function ClaimNFTs({ onFinish }: ClaimNFTsProps) {
  const { mintedNfts } = useCreationContext();
  const [recipients, setRecipients] = useState<Recipient[]>([{ name: '', email: '' }]);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailsConfirmation, setEmailsConfirmation] = useState<string[]>([]);
  const [previewNft, setPreviewNft] = useState<number | null>(null);
  const { toast } = useToast();
  
  const sendClaimEmailMutation = useMutation({
    mutationFn: async () => {
      console.log("Send claim email mutation started with NFTs:", mintedNfts);
      
      // Prepare NFT IDs to claim
      const nftIdsToSend = mintedNfts.map(nft => nft.id);
      
      // Filter out any recipients with empty emails
      const validRecipients = recipients.filter(r => r.email.trim() !== '');
      console.log("NFT IDs to claim:", nftIdsToSend, "Recipients:", validRecipients);
      
      if (validRecipients.length === 0) {
        throw new Error("At least one valid email is required");
      }
      
      const response = await apiRequest('POST', '/api/send-claim-email', { 
        nftIds: nftIdsToSend,
        recipients: validRecipients
      });
      
      const data = await response.json();
      console.log("API response:", response);
      console.log("JSON response data:", data);
      return { data, recipients: validRecipients };
    },
    onSuccess: ({ data, recipients }) => {
      console.log("Mutation successful with data:", data);
      setEmailSent(true);
      setEmailsConfirmation(recipients.map(r => r.email));
      
      const recipientText = recipients.length === 1 
        ? recipients[0].email
        : `${recipients.length} recipients`;
        
      toast({
        title: "Success!",
        description: `We've sent your Proof of Vibes to ${recipientText}.`,
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

  // Add a new recipient field
  const addRecipient = () => {
    setRecipients([...recipients, { name: '', email: '' }]);
  };

  // Remove a recipient field
  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      const newRecipients = [...recipients];
      newRecipients.splice(index, 1);
      setRecipients(newRecipients);
    }
  };
  
  // Update a recipient's information
  const updateRecipient = (index: number, field: 'name' | 'email', value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { 
      ...newRecipients[index], 
      [field]: value,
      // Clear error when updating the field
      error: field === 'email' ? validateEmail(value) : newRecipients[index].error
    };
    setRecipients(newRecipients);
  };
  
  // Validate an email address
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address';
    return undefined;
  };
  
  const handleSendEmail = () => {
    console.log("Send email button clicked with recipients:", recipients);
    
    // Validate all email addresses
    let hasError = false;
    const updatedRecipients = recipients.map(recipient => {
      const error = validateEmail(recipient.email);
      if (error) hasError = true;
      return { ...recipient, error };
    });
    
    setRecipients(updatedRecipients);
    
    if (hasError) {
      toast({
        title: "Invalid emails",
        description: "Please check all email addresses and try again",
        variant: "destructive",
      });
      return;
    }
    
    // If all validations pass, send the emails
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
          <div className="bg-green-500/20 border border-green-500/30 rounded-md p-3 mb-3">
            <p className="text-sm flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span>Certificate{emailsConfirmation.length > 1 ? 's' : ''} of Authenticity sent!</span>
            </p>
          </div>
          <p className="text-sm">
            We've sent your digital collectibles to:
          </p>
          <div className="flex flex-wrap gap-2 my-2">
            {emailsConfirmation.map((email, index) => (
              <Badge key={index} variant="secondary" className="bg-purple-500/20">
                {email}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-white/70">
            Check your email and follow the instructions to view and share your Proof of Vibes.
          </p>
          <Button 
            className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full font-medium text-white transition-colors"
            onClick={() => {
              setEmailSent(false);
              setRecipients([{ name: '', email: '' }]);
            }}
          >
            Send to another email
          </Button>
        </div>
      );
    }
    
    return (
      <div>
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-md mb-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <span>Group Photo Collection</span>
          </div>
          <p className="text-xs text-white/70">
            Send the same group photo to multiple recipients - perfect for sharing event memories.
          </p>
        </div>
      
        {/* Multiple Recipients */}
        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <div key={index} className="p-3 bg-black/20 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Recipient {index + 1}</h4>
                {recipients.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-red-500/20"
                    onClick={() => removeRecipient(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Name Input */}
              <div className="mb-3">
                <label className="block text-xs text-white/70 mb-1">Name (optional)</label>
                <Input
                  type="text"
                  value={recipient.name}
                  onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                  placeholder="Friend's name"
                  className="w-full px-3 py-1 text-sm bg-[#1A1A2E] border border-white/20 rounded-lg"
                />
              </div>
              
              {/* Email Input */}
              <div>
                <label className="block text-xs text-white/70 mb-1">Email</label>
                <Input
                  type="email"
                  value={recipient.email}
                  onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                  placeholder="their@email.com"
                  className={`w-full px-3 py-1 text-sm bg-[#1A1A2E] border ${
                    recipient.error ? 'border-red-500' : 'border-white/20'
                  } rounded-lg`}
                />
                {recipient.error && (
                  <p className="mt-1 text-xs text-red-500">{recipient.error}</p>
                )}
              </div>
            </div>
          ))}
          
          {/* Add Recipient Button */}
          <Button 
            variant="outline" 
            size="sm"
            className="w-full border-dashed border-white/30 hover:bg-white/5"
            onClick={addRecipient}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another recipient
          </Button>
        </div>
        
        <Button 
          className="w-full px-4 py-2 mt-6 rounded-full font-bold text-white transition-colors bg-primary hover:bg-primary/90"
          onClick={handleSendEmail}
          disabled={recipients.length === 0 || sendClaimEmailMutation.isPending}
        >
          {sendClaimEmailMutation.isPending 
            ? 'Sending...' 
            : recipients.length > 1 
              ? `Send to ${recipients.length} recipients` 
              : 'Send Certificate'}
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className="step-content">
        <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
          {/* Event-branded Header */}
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              <h2 className="font-heading text-3xl font-bold mb-1">
                Your Proof of Vibes Certificate
              </h2>
            </div>
            <p className="text-center mb-2 text-white/70">
              Your exclusive event memorabilia is ready to be claimed
            </p>
            <div className="flex justify-center items-center gap-2 text-sm text-white/50">
              <Award className="h-4 w-4" />
              <span>Authenticity guaranteed by certificate</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Claim via Email */}
            <div className={`p-4 rounded-lg border ${emailSent ? 'border-green-500 bg-green-500/10' : 'border-white/20 bg-[#1A1A2E]'}`}>
              <h3 className="font-heading text-lg font-medium mb-3">
                {emailSent ? (
                  <div className="flex items-center gap-2">
                    <Check className="text-green-500" />
                    Certificate Delivered
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="text-accent" />
                    Get Certificate via Email
                  </div>
                )}
              </h3>
              
              {renderEmailSection()}
            </div>
            
            {/* Claim via QR Code */}
            <div className="p-4 rounded-lg border border-white/20 bg-[#1A1A2E]">
              <h3 className="font-heading text-lg font-medium mb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="text-accent" />
                  Get Certificate via QR
                </div>
              </h3>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-md mb-3">
                  <div className="bg-white p-3 rounded-sm" id="claim-qr-code">
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
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-md w-full mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <SmartphoneNfc className="h-4 w-4 text-purple-400" />
                    <span className="font-medium">At the Event?</span>
                  </div>
                  <p className="text-xs text-white/70 mt-1">
                    Show this QR code to event staff to receive special perks!
                  </p>
                </div>
                {/* Download QR Code button hidden per request */}
              </div>
            </div>
          </div>
          
          {/* Collection Preview with Certificate Badges */}
          <div className="mt-8 mb-6">
            <h4 className="font-heading text-lg font-medium mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Your Certified Digital Collectibles
            </h4>
            <div className="flex overflow-x-auto pb-4 space-x-3">
              {mintedNfts.map((nft, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-32 aspect-[3/4] rounded-lg overflow-hidden relative group cursor-pointer"
                  onClick={() => setPreviewNft(index)}
                >
                  {/* Certificate Badge */}
                  <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] px-2 py-0.5 rounded-bl-md font-medium">
                    CERTIFIED
                  </div>
                  
                  <img 
                    src={nft.imageUrl} 
                    alt={`Digital Collectible ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Event Watermark */}
                  <div className="absolute top-1 left-1 bg-black/40 backdrop-blur-sm rounded-md p-1 text-[10px] flex items-center">
                    <Sparkles className="h-3 w-3 mr-1 text-purple-300" />
                    <span>Proof of Vibes</span>
                  </div>
                  
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
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full font-bold text-white transition-colors"
              onClick={onFinish}
            >
              Finish
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
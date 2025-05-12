import { useState, useEffect } from 'react';
import { useCreationContext } from '@/context/CreationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ChooseTemplateProps {
  onNext: () => void;
  onBack: () => void;
}

type Template = 'classic' | 'neon' | 'retro' | 'minimal';

interface TemplateOption {
  id: Template;
  name: string;
  description: string;
  gradientClasses: string;
}

export default function ChooseTemplate({ onNext, onBack }: ChooseTemplateProps) {
  const { selectedPhotos, setTemplateSelection } = useCreationContext();
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('classic');
  const [message, setMessage] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(0);
  const { toast } = useToast();

  // Template options
  const templates: TemplateOption[] = [
    { 
      id: 'classic', 
      name: 'Classic',
      description: 'Standard',
      gradientClasses: 'from-primary to-secondary'
    },
    { 
      id: 'neon', 
      name: 'Neon',
      description: 'Vibrant',
      gradientClasses: 'from-pink-500 to-blue-500'
    },
    { 
      id: 'retro', 
      name: 'Retro',
      description: 'Vintage',
      gradientClasses: 'from-amber-500 to-red-600'
    },
    { 
      id: 'minimal', 
      name: 'Minimal',
      description: 'Clean',
      gradientClasses: 'from-slate-700 to-slate-900'
    }
  ];

  // Available vibe tags
  const vibeOptions = [
    'excited', 'party', 'music', 'friends', 'memories', 'festival', 'cool', 'epic'
  ];

  // Cycle through preview images
  useEffect(() => {
    if (selectedPhotos.length === 0) return;
    
    const interval = setInterval(() => {
      setPreviewPhotoIndex((prev) => (prev + 1) % selectedPhotos.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [selectedPhotos]);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) => {
      if (prev.includes(vibe)) {
        return prev.filter(v => v !== vibe);
      } else {
        if (prev.length >= 3) {
          // Remove the first one to maintain max 3
          return [...prev.slice(1), vibe];
        }
        return [...prev, vibe];
      }
    });
  };

  const handleNext = () => {
    if (message.length > 30) {
      toast({
        title: "Message too long",
        description: "Please keep your message under 30 characters",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedVibes.length === 0) {
      toast({
        title: "No vibes selected",
        description: "Please select at least one vibe tag",
        variant: "destructive",
      });
      return;
    }
    
    // Save template selection to context
    setTemplateSelection({
      template: selectedTemplate,
      message: message || "Best event ever!",
      vibes: selectedVibes
    });
    
    onNext();
  };

  return (
    <div className="step-content">
      <div className="max-w-3xl mx-auto glassmorphism rounded-2xl overflow-hidden p-6">
        <h2 className="font-heading text-2xl font-bold mb-4 text-center">Choose Your Vibe Style</h2>
        <p className="text-center mb-6 text-white/70">Select a template that matches the event's energy!</p>
        
        {/* Template Preview */}
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-xl overflow-hidden mb-6 glassmorphism">
          {selectedPhotos.length > 0 && (
            <img 
              src={selectedPhotos[previewPhotoIndex]} 
              alt="Template Preview" 
              className="w-full h-full object-cover" 
            />
          )}
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A2E] to-transparent">
              <div className="flex gap-2 mb-2 flex-wrap">
                {selectedVibes.map((vibe, index) => (
                  <span key={index} className="vibe-tag text-xs px-2 py-1 rounded-full">#{vibe}</span>
                ))}
              </div>
              <p className="text-sm font-medium">{message || "Add your message here..."}</p>
            </div>
          </div>
        </div>
        
        {/* Message Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Add a short message</label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Best night ever!"
            className="w-full px-4 py-2 bg-[#1A1A2E] border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={30}
          />
          <p className="text-xs text-white/50 mt-1">Max 30 characters</p>
        </div>
        
        {/* Vibe Tags Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select your vibes (up to 3)</label>
          <div className="flex flex-wrap gap-2">
            {vibeOptions.map((vibe) => (
              <button
                key={vibe}
                className={`px-3 py-1 rounded-full border border-white/30 hover:bg-primary/20 transition-colors ${
                  selectedVibes.includes(vibe) ? 'bg-primary/40' : ''
                }`}
                onClick={() => toggleVibe(vibe)}
              >
                #{vibe}
              </button>
            ))}
          </div>
        </div>
        
        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select a template style</label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-item cursor-pointer p-2 rounded-lg border ${
                  selectedTemplate === template.id 
                    ? 'selected' 
                    : 'border-white/20 hover:border-accent'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className={`aspect-square bg-gradient-to-br ${template.gradientClasses} rounded-md flex items-center justify-center`}>
                  <span className="text-xs">{template.name}</span>
                </div>
                <p className="text-xs text-center mt-1">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline"
            className="px-6 py-2 border border-white/20 rounded-full font-medium text-white hover:bg-white/10 transition-colors"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left mr-2"></i> Back
          </Button>
          
          <Button 
            className="px-6 py-2 bg-gradient-to-r from-primary to-secondary rounded-full font-bold text-white"
            onClick={handleNext}
          >
            Next: Mint NFTs <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}

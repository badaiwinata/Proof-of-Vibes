interface ProgressIndicatorProps {
  currentStep: string;
}

type Step = {
  id: string;
  number: number;
  label: string;
};

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps: Step[] = [
    { id: 'take-photos', number: 1, label: 'Take Photos' },
    { id: 'select-photos', number: 2, label: 'Select Photos' },
    { id: 'choose-template', number: 3, label: 'Choose Style' },
    { id: 'mint-nfts', number: 4, label: 'Mint NFTs' },
    { id: 'claim-nfts', number: 5, label: 'Claim' }
  ];

  return (
    <div className="flex justify-between items-center w-full max-w-3xl mx-auto mb-8 px-6">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isPast = steps.findIndex(s => s.id === currentStep) >= steps.findIndex(s => s.id === step.id);
        
        return (
          <div 
            key={step.id} 
            className={`progress-step flex flex-col items-center w-1/5 ${isPast ? 'active' : ''}`}
            data-step={step.number}
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                isPast ? 'bg-primary' : 'bg-white/20'
              } text-white font-bold`}
            >
              {step.number}
            </div>
            <span className="text-center text-xs">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GiStack } from 'react-icons/gi';
import { cn } from '@/lib/utils';

interface EditionSelectionProps {
  onConfirm: (editionCount: number) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function EditionSelection({ onConfirm, onCancel, isOpen }: EditionSelectionProps) {
  const [editionCount, setEditionCount] = useState<number>(3);
  const [error, setError] = useState<string>('');
  
  const handleEditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (value < 1) {
      setError('Minimum copy count is 1');
      return;
    }
    
    if (value > 20) {
      setError('Maximum copy count is 20');
      return;
    }
    
    setError('');
    setEditionCount(value);
  };

  const handleConfirm = () => {
    if (editionCount < 1 || editionCount > 20) {
      setError('Please enter a number of copies between 1 and 20');
      return;
    }
    
    onConfirm(editionCount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Photo Copies</DialogTitle>
          <DialogDescription>
            How many copies of this photo would you like to create for your group?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-purple-50">
              <GiStack className="text-4xl text-purple-600" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Copy Count</h3>
              <p className="text-sm text-muted-foreground">
                Each person will receive a unique numbered photo copy.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="editionCount">Number of Photo Copies</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={editionCount === num ? "default" : "outline"}
                    onClick={() => {
                      setError('');
                      setEditionCount(num);
                    }}
                    className={cn(
                      "h-12 text-lg font-bold",
                      editionCount === num && "bg-gradient-to-r from-purple-600 to-indigo-600"
                    )}
                  >
                    {num}
                  </Button>
                ))}
                <div className="col-span-3 mt-1">
                  <Input 
                    id="editionCount"
                    type="number" 
                    min={1}
                    max={20}
                    value={editionCount > 9 ? editionCount : ''} 
                    onChange={handleEditionChange}
                    placeholder="Custom (10-20)"
                    className={cn("text-center", error && "border-red-500")}
                  />
                </div>
              </div>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            <p className="text-xs text-muted-foreground">
              This creates multiple numbered copies (like "Copy 2 of 5") of your photo.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleConfirm} 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Create {editionCount} Photo {editionCount === 1 ? 'Copy' : 'Copies'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
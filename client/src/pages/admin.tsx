import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, RefreshCw, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AdminPage() {
  const { toast } = useToast();
  const [adminToken, setAdminToken] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const handleReset = async () => {
    if (!adminToken) {
      toast({
        title: "Admin token required",
        description: "Please enter the admin token to continue",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsResetting(true);
      setStatus('idle');
      setMessage('');
      
      const response = await apiRequest('POST', '/api/admin/reset', { adminToken });
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Data reset successful');
        toast({
          title: "Success",
          description: "All user data has been reset",
          variant: "default"
        });
      } else {
        setStatus('error');
        setMessage(data.message || 'Error resetting data');
        toast({
          title: "Reset failed",
          description: data.message || 'Error resetting data',
          variant: "destructive"
        });
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error or server unreachable');
      toast({
        title: "Reset failed",
        description: "Network error or server unreachable",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0A0A1B] flex flex-col">
      <Header onCreateClick={() => {}} hideCreateButton={true} />
      
      <main className="flex-1 container max-w-md mx-auto py-8 px-4">
        <Card className="glassmorphism border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-400" />
              Admin Panel
            </CardTitle>
            <CardDescription>
              Reset user-generated data for demo purposes
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Token</label>
              <Input
                type="password"
                placeholder="Enter admin token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="bg-white/10 border-white/20"
              />
              <p className="text-xs text-white/60">Default token: proof-of-vibes-admin</p>
            </div>
            
            {status === 'success' && (
              <Alert className="bg-green-900/20 border-green-500/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription className="text-white/80">
                  {message}
                </AlertDescription>
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert className="bg-red-900/20 border-red-500/50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-white/80">
                  {message}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-md">
              <h3 className="text-sm font-medium flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                Warning
              </h3>
              <p className="text-xs text-white/80 mt-1">
                This action will delete all user-generated NFTs and session photos. 
                Only sample NFTs will be preserved. This action cannot be undone.
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
              onClick={handleReset}
              disabled={isResetting || !adminToken}
            >
              {isResetting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> 
                  Resetting Data...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> 
                  Reset All User Data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
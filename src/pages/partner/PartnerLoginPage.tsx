import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartner } from '@/contexts/PartnerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Lock, Mail, Loader2 } from 'lucide-react';

const PartnerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = usePartner();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/partner/dashboard');
    else setError('Identifiants invalides');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white">
        <CardHeader className="text-center pb-2 pt-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
            <span className="text-[#C9A84C]">C</span>ABY
          </h1>
          <p className="text-sm text-[#888] mt-1 tracking-widest uppercase">Espace Partenaires</p>
        </CardHeader>
        <CardContent className="px-8 pb-10 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#555] text-sm">Email professionnel</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                <Input id="email" type="email" placeholder="contact@entreprise.ch" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] placeholder:text-[#CCC] focus-visible:ring-[#C9A84C] rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#555] text-sm">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]" />
                <Input id="password" type="password" placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-[#F9F9F9] border-[#E0E0E0] text-[#1A1A1A] placeholder:text-[#CCC] focus-visible:ring-[#C9A84C] rounded-xl" />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" disabled={loading}
              className="w-full h-12 bg-[#C9A84C] hover:bg-[#B8973F] text-white font-semibold rounded-xl text-base">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
            </Button>
          </form>
          <p className="text-center text-xs text-[#BBB] mt-8">
            Caby Partner Platform · Talent Access Technologies SA
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerLoginPage;

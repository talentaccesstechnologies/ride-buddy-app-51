import React, { useState, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Phone, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from '@/components/shared/Logo';

type AuthMode = 'phone' | 'email';
type PhoneStep = 'number' | 'otp';

const countryCodes = [
  { code: '+41', flag: '🇨🇭', name: 'Suisse' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Allemagne' },
  { code: '+39', flag: '🇮🇹', name: 'Italie' },
  { code: '+44', flag: '🇬🇧', name: 'Royaume-Uni' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'rider';
  const { signIn } = useAuth();

  const [mode, setMode] = useState<AuthMode>('phone');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('number');
  const [loading, setLoading] = useState(false);

  // Phone state
  const [countryIdx, setCountryIdx] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpValue, setOtpValue] = useState('');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const selectedCountry = countryCodes[countryIdx];

  const handleSendOTP = async () => {
    const fullPhone = `${selectedCountry.code}${phoneNumber.replace(/\s/g, '')}`;
    if (phoneNumber.replace(/\s/g, '').length < 8) {
      toast.error('Numéro invalide');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setLoading(false);
    if (error) {
      toast.error('Erreur d\'envoi du SMS', { description: error.message });
    } else {
      toast.success('Code envoyé !', { description: `Un SMS a été envoyé au ${fullPhone}` });
      setPhoneStep('otp');
    }
  };

  const handleVerifyOTP = async () => {
    const fullPhone = `${selectedCountry.code}${phoneNumber.replace(/\s/g, '')}`;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otpValue, type: 'sms' });
    setLoading(false);
    if (error) {
      toast.error('Code invalide', { description: 'Veuillez réessayer.' });
    } else {
      toast.success('Connexion réussie !');
      navigate(role === 'driver' ? '/caby/driver/dashboard' : '/caby/van');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error('Échec de la connexion', { description: 'Email ou mot de passe incorrect' });
    } else {
      toast.success('Connexion réussie !');
      navigate(role === 'driver' ? '/caby/driver/dashboard' : '/caby/van');
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setPhoneStep('number');
    setOtpValue('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6">
        <Link to="/">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {role === 'driver' ? 'Espace Chauffeur' : 'Bienvenue'}
            </h2>
            <p className="text-muted-foreground text-sm">
              Connectez-vous pour continuer
            </p>
          </div>

          {/* Mode toggle pills */}
          <div className="flex bg-card border border-border rounded-2xl p-1 mb-8">
            <button
              onClick={() => switchMode('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === 'phone'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Phone className="w-4 h-4" />
              Téléphone
            </button>
            <button
              onClick={() => switchMode('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === 'email'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          {/* Phone mode */}
          <div className={`transition-all duration-300 ${mode === 'phone' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute pointer-events-none'}`}>
            {phoneStep === 'number' ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Numéro de téléphone</label>
                  <div className="flex gap-2">
                    {/* Country selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryPicker(!showCountryPicker)}
                        className="h-14 px-3 bg-card border border-border rounded-2xl flex items-center gap-1.5 hover:border-primary/30 transition-colors"
                      >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium">{selectedCountry.code}</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </button>
                      {showCountryPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[200px]">
                          {countryCodes.map((c, i) => (
                            <button
                              key={c.code}
                              onClick={() => { setCountryIdx(i); setShowCountryPicker(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted transition-colors ${
                                i === countryIdx ? 'bg-primary/10 text-primary' : ''
                              }`}
                            >
                              <span className="text-lg">{c.flag}</span>
                              <span className="font-medium">{c.name}</span>
                              <span className="text-muted-foreground ml-auto">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Phone input */}
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="79 123 45 67"
                      className="flex-1 h-14 bg-card border-border rounded-2xl text-lg tracking-wide placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSendOTP}
                  className="w-full h-14 btn-gold rounded-2xl text-lg font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Recevoir le code SMS
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Code envoyé au
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {selectedCountry.flag} {selectedCountry.code} {phoneNumber}
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={(val) => setOtpValue(val)}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="w-12 h-14 text-xl bg-card border-border rounded-xl"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerifyOTP}
                  className="w-full h-14 btn-gold rounded-2xl text-lg font-bold"
                  disabled={loading || otpValue.length < 6}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Vérifier
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="flex justify-between text-sm">
                  <button
                    onClick={() => { setPhoneStep('number'); setOtpValue(''); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Changer de numéro
                  </button>
                  <button
                    onClick={handleSendOTP}
                    className="text-primary font-medium hover:underline"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email mode */}
          <div className={`transition-all duration-300 ${mode === 'email' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute pointer-events-none'}`}>
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="h-14 pl-12 bg-card border-border rounded-2xl placeholder:text-muted-foreground/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 pl-12 pr-12 bg-card border-border rounded-2xl placeholder:text-muted-foreground/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-14 btn-gold rounded-2xl text-lg font-bold"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social login */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl border-border hover:bg-card hover:border-primary/30"
              type="button"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl border-border hover:bg-card hover:border-primary/30"
              type="button"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Continuer avec Apple
            </Button>
          </div>

          {/* Sign up link */}
          <p className="text-center mt-10 text-muted-foreground text-sm">
            Pas encore de compte ?{' '}
            <Link to={`/auth/register?role=${role}`} className="text-primary font-semibold hover:underline">
              S'inscrire
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center mt-6 text-[9px] text-muted-foreground/40 tracking-widest uppercase">
            Caby LSE Certified · ENCRYPTED_STREAM_V2_ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

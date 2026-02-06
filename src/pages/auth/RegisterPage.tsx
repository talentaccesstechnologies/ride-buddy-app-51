import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'rider' | 'driver'>('rider');

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!fullName || !email || !password || !confirmPassword) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }
      if (password.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 3) as Step);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast.error('Échec de l\'inscription', {
        description: error.message,
      });
    } else {
      toast.success('Inscription réussie !', {
        description: 'Vérifiez votre email pour confirmer votre compte',
      });
      navigate('/auth/login');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back button */}
          {step > 1 && (
            <button
              onClick={() => setStep((prev) => Math.max(prev - 1, 1) as Step)}
              className="flex items-center gap-2 text-muted-foreground mb-6 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          )}

          {/* Step 1: Basic info */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Créer un compte</h2>
                <p className="text-muted-foreground">
                  Étape 1 sur 3 : Informations de base
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  {/* Password strength */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordStrength() >= level
                            ? level <= 2
                              ? 'bg-warning'
                              : 'bg-success'
                            : 'bg-secondary'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-12"
                      required
                    />
                    {confirmPassword && password === confirmPassword && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                    )}
                  </div>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full h-12 text-lg mt-6">
                Continuer
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </>
          )}

          {/* Step 2: Phone */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Numéro de téléphone</h2>
                <p className="text-muted-foreground">
                  Étape 2 sur 3 : Pour vous contacter
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="h-12 text-center text-lg"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Nous vous enverrons un code de vérification
                </p>
              </div>

              <Button onClick={handleNext} className="w-full h-12 text-lg mt-6">
                Continuer
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <button
                onClick={handleNext}
                className="w-full text-center text-muted-foreground mt-4 py-2"
              >
                Passer cette étape
              </button>
            </>
          )}

          {/* Step 3: Role selection */}
          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Comment voulez-vous utiliser l'app ?</h2>
                <p className="text-muted-foreground">
                  Étape 3 sur 3 : Choisissez votre rôle
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setRole('rider')}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    role === 'rider'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="text-4xl mb-3">🚖</div>
                  <h3 className="text-lg font-semibold">Je suis passager</h3>
                  <p className="text-muted-foreground">
                    Je veux commander des courses
                  </p>
                </button>

                <button
                  onClick={() => setRole('driver')}
                  className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                    role === 'driver'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="text-4xl mb-3">🚗</div>
                  <h3 className="text-lg font-semibold">Je suis chauffeur</h3>
                  <p className="text-muted-foreground">
                    Je veux conduire et gagner de l'argent
                  </p>
                </button>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full h-12 text-lg mt-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </>
          )}

          {/* Login link */}
          <p className="text-center mt-8 text-muted-foreground">
            Déjà un compte ?{' '}
            <Link to="/auth/login" className="text-accent font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

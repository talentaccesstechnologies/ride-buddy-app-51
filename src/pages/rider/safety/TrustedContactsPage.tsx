import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/rider/BottomNav';

interface Contact {
  id: string;
  name: string;
  initials: string;
}

const TrustedContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Maman', initials: 'MA' },
    { id: '2', name: 'Alex B.', initials: 'AB' },
  ]);

  const handleRemove = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/caby/account/safety')} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Contacts de confiance</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          Choisissez jusqu'à 5 proches avec qui partager votre position. Vous pourrez leur envoyer votre itinéraire en un clic.
        </p>

        {/* Contact list */}
        <div className="space-y-3 mb-8">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {c.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> Actif
                  </p>
                </div>
              </div>
              <button onClick={() => handleRemove(c.id)} className="p-2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>

        {contacts.length < 5 && (
          <Button className="w-full gap-2" variant="outline">
            <UserPlus className="w-4 h-4" />
            Ajouter un contact
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          {contacts.length}/5 contacts ajoutés
        </p>
      </div>
      <BottomNav />
    </div>
  );
};

export default TrustedContactsPage;

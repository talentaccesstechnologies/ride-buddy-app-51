import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LegalBlockOverlay: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
      <div className="bg-caby-card border border-caby-red/30 rounded-3xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-caby-red/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-caby-red" />
        </div>

        <h2 className="text-2xl font-display font-bold text-white mb-3">
          ⚠️ Accès aux courses suspendu
        </h2>

        <p className="text-caby-muted mb-6">
          Vos documents LSE/LTVTC nécessitent une mise à jour pour reprendre l'activité.
        </p>

        <Button
          onClick={() => navigate('/caby/driver/documents')}
          className="w-full btn-gold py-4 rounded-2xl"
        >
          <FileText className="w-5 h-5 mr-2" />
          Vérifier mes documents
        </Button>

        <p className="text-xs text-caby-muted mt-4">
          Contactez le support si vous pensez qu'il s'agit d'une erreur.
        </p>
      </div>
    </div>
  );
};

export default LegalBlockOverlay;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '@/assets/caby-logo.png';

interface CabyLogoProps {
  size?: number;        // Hauteur en px (largeur auto)
  to?: string;          // Destination, défaut /caby
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

/**
 * Logo officiel Caby — toujours cliquable, renvoie à l'accueil par défaut.
 * Utilise l'image PNG fournie par le client (src/assets/caby-logo.png).
 */
const CabyLogo: React.FC<CabyLogoProps> = ({
  size = 32,
  to = '/caby',
  className,
  style,
  alt = 'Caby',
}) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      aria-label="Retour à l'accueil Caby"
      className={className}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 0,
        ...style,
      }}
    >
      <img
        src={logoUrl}
        alt={alt}
        style={{ height: size, width: 'auto', display: 'block' }}
      />
    </button>
  );
};

export default CabyLogo;

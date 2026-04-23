import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CabyLogoProps {
  size?: number;        // Taille de police en px
  to?: string;          // Destination, défaut /caby
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

/**
 * Logo officiel Caby — wordmark "Caby" en Playfair Display.
 * Toujours cliquable, renvoie à l'accueil par défaut.
 */
const CabyLogo: React.FC<CabyLogoProps> = ({
  size = 28,
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
      aria-label={`${alt} — retour à l'accueil`}
      className={className}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
        fontFamily: "'Playfair Display', serif",
        fontWeight: 900,
        fontSize: size,
        color: '#0A0A0A',
        letterSpacing: '-1px',
        ...style,
      }}
    >
      Caby
    </button>
  );
};

export default CabyLogo;

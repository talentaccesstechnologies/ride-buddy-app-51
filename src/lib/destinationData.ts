import zermattImg from '@/assets/zermatt.jpg';
import zurichImg from '@/assets/zurich.jpg';
import verbierImg from '@/assets/verbier.jpg';
import lausanneImg from '@/assets/lausanne.jpg';
import annecyImg from '@/assets/annecy.jpg';
import lyonImg from '@/assets/lyon.jpg';
import baleImg from '@/assets/bale.jpg';
import berneImg from '@/assets/berne.jpg';
import chamberyImg from '@/assets/chambery.jpg';
import chamonixImg from '@/assets/chamonix.jpg';
import sionImg from '@/assets/sion.jpg';
import neuchatelImg from '@/assets/neuchatel.jpg';
import montreuxImg from '@/assets/montreux.jpg';
import davosImg from '@/assets/davos.jpg';
import gstaadImg from '@/assets/gstaad.jpg';
import parisImg from '@/assets/paris.jpg';
import milanImg from '@/assets/milan.jpg';
import munichImg from '@/assets/munich.jpg';

export interface Destination {
  city: string;
  country: string;
  countryFlag: string;
  region: 'suisse' | 'france' | 'italie' | 'allemagne';
  category: 'ville' | 'ski' | 'lac' | 'nature';
  priceFrom: number;
  lat: number;
  lng: number;
}

export const IMAGE_MAP: Record<string, string> = {
  Zurich: zurichImg, Lausanne: lausanneImg, Verbier: verbierImg, Zermatt: zermattImg,
  Annecy: annecyImg, Lyon: lyonImg, 'Bâle': baleImg, Berne: berneImg,
  'Chambéry': chamberyImg, Chamonix: chamonixImg, Sion: sionImg,
  'Neuchâtel': neuchatelImg, Montreux: montreuxImg, Davos: davosImg,
  Gstaad: gstaadImg, Paris: parisImg, Milan: milanImg, Munich: munichImg,
};

export const ALL_DESTINATIONS: Destination[] = [
  { city: 'Zurich', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ville', priceFrom: 54, lat: 47.3769, lng: 8.5417 },
  { city: 'Lausanne', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ville', priceFrom: 18, lat: 46.5197, lng: 6.6323 },
  { city: 'Berne', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ville', priceFrom: 39, lat: 46.9480, lng: 7.4474 },
  { city: 'Bâle', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ville', priceFrom: 52, lat: 47.5596, lng: 7.5886 },
  { city: 'Sion', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'nature', priceFrom: 45, lat: 46.2333, lng: 7.3500 },
  { city: 'Montreux', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'lac', priceFrom: 29, lat: 46.4312, lng: 6.9107 },
  { city: 'Neuchâtel', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'lac', priceFrom: 32, lat: 46.9900, lng: 6.9293 },
  { city: 'Verbier', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ski', priceFrom: 35, lat: 46.0967, lng: 7.2286 },
  { city: 'Zermatt', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ski', priceFrom: 55, lat: 46.0207, lng: 7.7491 },
  { city: 'Davos', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ski', priceFrom: 45, lat: 46.8027, lng: 9.8360 },
  { city: 'Gstaad', country: 'Suisse', countryFlag: '🇨🇭', region: 'suisse', category: 'ski', priceFrom: 62, lat: 46.4748, lng: 7.2863 },
  { city: 'Chamonix', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'ski', priceFrom: 28, lat: 45.9237, lng: 6.8694 },
  { city: 'Annecy', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'lac', priceFrom: 15, lat: 45.8992, lng: 6.1294 },
  { city: 'Lyon', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'ville', priceFrom: 42, lat: 45.7640, lng: 4.8357 },
  { city: 'Chambéry', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'ville', priceFrom: 32, lat: 45.5646, lng: 5.9178 },
  { city: 'Paris', country: 'France', countryFlag: '🇫🇷', region: 'france', category: 'ville', priceFrom: 65, lat: 48.8566, lng: 2.3522 },
  { city: 'Milan', country: 'Italie', countryFlag: '🇮🇹', region: 'italie', category: 'ville', priceFrom: 79, lat: 45.4642, lng: 9.1900 },
  { city: 'Munich', country: 'Allemagne', countryFlag: '🇩🇪', region: 'allemagne', category: 'ville', priceFrom: 72, lat: 48.1351, lng: 11.5820 },
];

// Featured destinations for the "Coup de Coeur" carousel
export const FEATURED_CITIES = ['Annecy', 'Montreux', 'Lyon', 'Zermatt', 'Chamonix', 'Milan', 'Lausanne', 'Paris'];

// Simulated connections from Geneva
export const CONNECTIONS_FROM_GENEVA: Record<string, Array<{ route: string; duration: string; priceFrom: number; nextDate: string }>> = {
  Annecy: [
    { route: 'Genève → Annecy', duration: '45 min', priceFrom: 15, nextDate: 'avr. 2026' },
    { route: 'Genève → Annecy (express)', duration: '35 min', priceFrom: 22, nextDate: 'avr. 2026' },
    { route: 'Genève Aéroport → Annecy', duration: '55 min', priceFrom: 18, nextDate: 'mai 2026' },
  ],
  Montreux: [
    { route: 'Genève → Montreux', duration: '1h10', priceFrom: 29, nextDate: 'avr. 2026' },
    { route: 'Genève → Montreux (via Lausanne)', duration: '1h25', priceFrom: 25, nextDate: 'avr. 2026' },
  ],
  Lyon: [
    { route: 'Genève → Lyon Part-Dieu', duration: '1h45', priceFrom: 42, nextDate: 'avr. 2026' },
    { route: 'Genève → Lyon Perrache', duration: '1h55', priceFrom: 39, nextDate: 'mai 2026' },
    { route: 'Genève Aéroport → Lyon', duration: '1h50', priceFrom: 45, nextDate: 'avr. 2026' },
  ],
  Zermatt: [
    { route: 'Genève → Zermatt', duration: '3h15', priceFrom: 55, nextDate: 'avr. 2026' },
    { route: 'Genève → Täsch (navette Zermatt)', duration: '3h00', priceFrom: 49, nextDate: 'mai 2026' },
  ],
  Chamonix: [
    { route: 'Genève → Chamonix', duration: '1h15', priceFrom: 28, nextDate: 'avr. 2026' },
    { route: 'Genève Aéroport → Chamonix', duration: '1h25', priceFrom: 32, nextDate: 'avr. 2026' },
  ],
  Milan: [
    { route: 'Genève → Milan Centre', duration: '4h00', priceFrom: 79, nextDate: 'mai 2026' },
    { route: 'Genève → Milan Malpensa', duration: '3h45', priceFrom: 75, nextDate: 'mai 2026' },
  ],
  Lausanne: [
    { route: 'Genève → Lausanne', duration: '45 min', priceFrom: 18, nextDate: 'avr. 2026' },
    { route: 'Genève Aéroport → Lausanne', duration: '55 min', priceFrom: 22, nextDate: 'avr. 2026' },
    { route: 'Genève → Lausanne (express)', duration: '35 min', priceFrom: 25, nextDate: 'avr. 2026' },
  ],
  Paris: [
    { route: 'Genève → Paris', duration: '5h30', priceFrom: 65, nextDate: 'mai 2026' },
    { route: 'Genève → Paris (nuit)', duration: '6h00', priceFrom: 55, nextDate: 'juin 2026' },
  ],
  Zurich: [
    { route: 'Genève → Zurich', duration: '2h50', priceFrom: 54, nextDate: 'avr. 2026' },
    { route: 'Genève Aéroport → Zurich', duration: '3h00', priceFrom: 58, nextDate: 'mai 2026' },
  ],
  Berne: [
    { route: 'Genève → Berne', duration: '1h50', priceFrom: 39, nextDate: 'avr. 2026' },
  ],
  'Bâle': [
    { route: 'Genève → Bâle', duration: '2h45', priceFrom: 52, nextDate: 'avr. 2026' },
  ],
  Verbier: [
    { route: 'Genève → Verbier', duration: '1h45', priceFrom: 35, nextDate: 'avr. 2026' },
  ],
  Davos: [
    { route: 'Genève → Davos', duration: '3h30', priceFrom: 45, nextDate: 'mai 2026' },
  ],
  Gstaad: [
    { route: 'Genève → Gstaad', duration: '2h15', priceFrom: 62, nextDate: 'mai 2026' },
  ],
  'Chambéry': [
    { route: 'Genève → Chambéry', duration: '1h00', priceFrom: 32, nextDate: 'avr. 2026' },
  ],
  Sion: [
    { route: 'Genève → Sion', duration: '1h40', priceFrom: 45, nextDate: 'avr. 2026' },
  ],
  'Neuchâtel': [
    { route: 'Genève → Neuchâtel', duration: '1h30', priceFrom: 32, nextDate: 'avr. 2026' },
  ],
  Munich: [
    { route: 'Genève → Munich', duration: '5h00', priceFrom: 72, nextDate: 'mai 2026' },
  ],
};

// Similar destinations mapping
export const SIMILAR_DESTINATIONS: Record<string, string[]> = {
  Annecy: ['Chamonix', 'Montreux', 'Chambéry'],
  Montreux: ['Lausanne', 'Annecy', 'Sion'],
  Lyon: ['Chambéry', 'Paris', 'Annecy'],
  Zermatt: ['Verbier', 'Chamonix', 'Davos'],
  Chamonix: ['Verbier', 'Zermatt', 'Annecy'],
  Milan: ['Lyon', 'Munich', 'Paris'],
  Lausanne: ['Montreux', 'Neuchâtel', 'Berne'],
  Paris: ['Lyon', 'Milan', 'Munich'],
  Zurich: ['Berne', 'Bâle', 'Munich'],
  Berne: ['Zurich', 'Neuchâtel', 'Lausanne'],
  'Bâle': ['Zurich', 'Berne', 'Munich'],
  Verbier: ['Zermatt', 'Chamonix', 'Gstaad'],
  Davos: ['Zermatt', 'Gstaad', 'Zurich'],
  Gstaad: ['Verbier', 'Davos', 'Montreux'],
  'Chambéry': ['Annecy', 'Lyon', 'Chamonix'],
  Sion: ['Verbier', 'Montreux', 'Zermatt'],
  'Neuchâtel': ['Lausanne', 'Berne', 'Montreux'],
  Munich: ['Zurich', 'Milan', 'Paris'],
};

// Centralised local image references — replaces all external (Unsplash) URLs.
// Avatars are generated as inline SVG data URIs (zero network, zero binary).

import vehicleBerline from '@/assets/vehicle-berline.jpg';
import vehicleSuv from '@/assets/vehicle-suv.jpg';
import vehicleVanPremium from '@/assets/vehicle-van-premium.jpg';
import vehicleVanShared from '@/assets/vehicle-van-shared.jpg';

import annecyImg from '@/assets/annecy.jpg';
import zurichImg from '@/assets/zurich.jpg';
import lausanneImg from '@/assets/lausanne.jpg';
import milanImg from '@/assets/milan.jpg';
import parisImg from '@/assets/paris.jpg';
import montreuxImg from '@/assets/montreux.jpg';
import zermattImg from '@/assets/zermatt.jpg';
import chamonixImg from '@/assets/chamonix.jpg';

// ─── Vehicle images (used in CabyVanPage seat selection) ───
export const vehicleImages = {
  van_shared: vehicleVanShared,
  berline_standard: vehicleBerline,
  suv_premium: vehicleSuv,
  van_private_standard: vehicleVanShared,
  van_private_premium: vehicleVanPremium,
};

// ─── Local destination/scene images ───
export const sceneImages = {
  alps: chamonixImg,
  annecy: annecyImg,
  zurich: zurichImg,
  lausanne: lausanneImg,
  milan: milanImg,
  paris: parisImg,
  lacLeman: montreuxImg,
  zermatt: zermattImg,
  chamonix: chamonixImg,
};

// ─── Avatar generator: deterministic SVG with initials on coloured circle ───
const AVATAR_PALETTE = [
  '#C9A84C', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EF4444', '#06B6D4', '#EC4899', '#84CC16', '#F97316',
  '#A855F7', '#14B8A6', '#F43F5E', '#0EA5E9', '#22C55E',
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Returns a self-contained inline SVG data URI for an avatar. */
export function getAvatarDataUri(name: string, size = 150): string {
  const initials = getInitials(name);
  const color = AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length];
  const fontSize = Math.round(size * 0.42);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${color}"/><text x="50%" y="50%" dy=".1em" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

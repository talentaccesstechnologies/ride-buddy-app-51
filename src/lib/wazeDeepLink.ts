/**
 * Opens Waze app with the destination pre-filled for navigation.
 * Falls back to Google Maps if Waze is not installed.
 */
export const openWazeNavigation = (lat: number, lng: number) => {
  const wazeUrl = `waze://?ll=${lat},${lng}&navigate=yes`;
  const fallbackUrl = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  // Try Waze deep link first
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = wazeUrl;
  document.body.appendChild(iframe);

  // If Waze doesn't open within 2s, fallback to web
  setTimeout(() => {
    document.body.removeChild(iframe);
    window.open(fallbackUrl, '_blank');
  }, 2000);
};

/**
 * Direct open - works better on mobile
 */
export const navigateWithWaze = (lat: number, lng: number) => {
  window.location.href = `waze://?ll=${lat},${lng}&navigate=yes`;
};

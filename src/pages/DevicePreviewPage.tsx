import React, { useState } from 'react';
import { RotateCw, Smartphone, Monitor } from 'lucide-react';

const DEVICES = [
  { id: 'iphone14pro', name: 'iPhone 14 Pro', w: 393, h: 852, notch: 'dynamic-island' },
  { id: 'iphonese', name: 'iPhone SE', w: 375, h: 667, notch: 'none' },
  { id: 'galaxy', name: 'Galaxy S23', w: 360, h: 780, notch: 'punch-hole' },
  { id: 'pixel7', name: 'Pixel 7', w: 412, h: 915, notch: 'punch-hole' },
] as const;

const VIEWS = [
  { id: 'client-home', label: 'Client — Home', path: '/caby' },
  { id: 'client-services', label: 'Client — Services', path: '/caby/services' },
  { id: 'client-trip', label: 'Client — Course en cours', path: '/caby/trip' },
  { id: 'driver-dashboard', label: 'Chauffeur — Dashboard', path: '/caby/driver/dashboard' },
  { id: 'driver-club', label: 'Chauffeur — Club', path: '/caby/driver/club' },
  { id: 'driver-colis', label: 'Chauffeur — Mode Colis', path: '/caby/driver/colis' },
  { id: 'driver-earnings', label: 'Chauffeur — Gains', path: '/caby/driver/earnings' },
  { id: 'driver-profile', label: 'Chauffeur — Profil', path: '/caby/driver/profile' },
];

type NotchType = 'dynamic-island' | 'punch-hole' | 'none';

const StatusBar: React.FC<{ width: number; notch: NotchType }> = ({ width, notch }) => {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 pt-3 pb-1 text-white text-[11px] font-semibold"
      style={{ height: notch === 'dynamic-island' ? 54 : notch === 'punch-hole' ? 36 : 24 }}
    >
      <span>{time}</span>

      {notch === 'dynamic-island' && (
        <div className="absolute left-1/2 -translate-x-1/2 top-3 w-[126px] h-[37px] bg-black rounded-full" />
      )}
      {notch === 'punch-hole' && (
        <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3 h-3 bg-black rounded-full" />
      )}

      <div className="flex items-center gap-1">
        {/* Signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="7" width="3" height="4" rx="0.5" fill="white" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="white" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="white" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="white" />
        </svg>
        {/* Wi-Fi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M7.5 9.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" fill="white" />
          <path d="M4.5 8a4.5 4.5 0 016 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M2 5.5a7.5 7.5 0 0111 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <svg width="25" height="11" viewBox="0 0 25 11" fill="none">
          <rect x="0" y="0.5" width="22" height="10" rx="2" stroke="white" strokeWidth="1" />
          <rect x="1.5" y="2" width="17" height="7" rx="1" fill="#34D399" />
          <path d="M23 4v3a1 1 0 001-1V5a1 1 0 00-1-1z" fill="white" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
};

const PhoneFrame: React.FC<{
  width: number;
  height: number;
  notch: NotchType;
  landscape: boolean;
  children: React.ReactNode;
}> = ({ width, height, notch, landscape, children }) => {
  const screenW = landscape ? height : width;
  const screenH = landscape ? width : height;

  const scale = Math.min(
    (window.innerHeight - 160) / (screenH + 40),
    (window.innerWidth - 400) / (screenW + 40),
    1
  );

  return (
    <div className="flex items-center justify-center flex-1">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          className="relative"
          style={{
            width: screenW + 24,
            height: screenH + 24,
            borderRadius: 48,
            background: 'linear-gradient(145deg, #2a2a2e, #1a1a1e)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            padding: 12,
          }}
        >
          {/* Side buttons */}
          {!landscape && (
            <>
              {/* Power */}
              <div
                className="absolute bg-[#3a3a3e] rounded-l-sm"
                style={{ right: -3, top: 120, width: 3, height: 60 }}
              />
              {/* Volume up */}
              <div
                className="absolute bg-[#3a3a3e] rounded-r-sm"
                style={{ left: -3, top: 100, width: 3, height: 35 }}
              />
              {/* Volume down */}
              <div
                className="absolute bg-[#3a3a3e] rounded-r-sm"
                style={{ left: -3, top: 145, width: 3, height: 35 }}
              />
              {/* Silent switch */}
              <div
                className="absolute bg-[#3a3a3e] rounded-r-sm"
                style={{ left: -3, top: 70, width: 3, height: 18 }}
              />
            </>
          )}

          {/* Screen */}
          <div
            className="relative overflow-hidden bg-black"
            style={{
              width: screenW,
              height: screenH,
              borderRadius: 36,
            }}
          >
            {!landscape && <StatusBar width={screenW} notch={notch} />}
            {children}
            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/30 rounded-full z-30" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DevicePreviewPage: React.FC = () => {
  const [deviceIdx, setDeviceIdx] = useState(0);
  const [viewIdx, setViewIdx] = useState(3); // default: driver dashboard
  const [landscape, setLandscape] = useState(false);

  const device = DEVICES[deviceIdx];
  const view = VIEWS[viewIdx];

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-6 py-3 bg-[#141416] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-white/50" />
          <span className="text-sm font-bold text-white/90 tracking-wide">CABY PREVIEW</span>
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* Device selector */}
        <div className="flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-white/40" />
          <select
            value={deviceIdx}
            onChange={(e) => setDeviceIdx(Number(e.target.value))}
            className="bg-white/10 text-white text-xs rounded-lg px-3 py-1.5 border border-white/10 outline-none hover:bg-white/15 transition-colors cursor-pointer"
          >
            {DEVICES.map((d, i) => (
              <option key={d.id} value={i} className="bg-[#1a1a1e] text-white">
                {d.name} ({d.w}×{d.h})
              </option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* View selector */}
        <select
          value={viewIdx}
          onChange={(e) => setViewIdx(Number(e.target.value))}
          className="bg-white/10 text-white text-xs rounded-lg px-3 py-1.5 border border-white/10 outline-none hover:bg-white/15 transition-colors cursor-pointer"
        >
          {VIEWS.map((v, i) => (
            <option key={v.id} value={i} className="bg-[#1a1a1e] text-white">
              {v.label}
            </option>
          ))}
        </select>

        <div className="h-5 w-px bg-white/10" />

        {/* Rotate */}
        <button
          onClick={() => setLandscape(!landscape)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            landscape
              ? 'bg-[hsl(var(--caby-gold))]/20 text-[hsl(var(--caby-gold))] border border-[hsl(var(--caby-gold))]/30'
              : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/15'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          {landscape ? 'Paysage' : 'Portrait'}
        </button>

        {/* Current dimensions */}
        <div className="ml-auto text-[10px] text-white/30 font-mono tabular-nums">
          {landscape ? `${device.h}×${device.w}` : `${device.w}×${device.h}`}px
        </div>
      </div>

      {/* Phone */}
      <PhoneFrame
        width={device.w}
        height={device.h}
        notch={device.notch}
        landscape={landscape}
      >
        <iframe
          key={`${view.path}-${device.id}-${landscape}`}
          src={view.path}
          className="w-full h-full border-0"
          style={{ colorScheme: 'normal' }}
          title={`Preview: ${view.label}`}
        />
      </PhoneFrame>
    </div>
  );
};

export default DevicePreviewPage;

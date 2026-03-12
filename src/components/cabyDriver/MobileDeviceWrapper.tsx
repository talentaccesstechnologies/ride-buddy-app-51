import React from 'react';

interface Props {
  children: React.ReactNode;
}

const MobileDeviceWrapper: React.FC<Props> = ({ children }) => {
  // Skip wrapper when rendered inside an iframe (e.g. /preview page)
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  if (isInIframe) {
    return <div className="h-full w-full">{children}</div>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#111]">
      <div
        className="relative w-full max-w-[390px] bg-background overflow-hidden shadow-2xl shadow-black/50"
        style={{
          height: '844px',
          maxHeight: '100vh',
          borderRadius: '24px',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileDeviceWrapper;

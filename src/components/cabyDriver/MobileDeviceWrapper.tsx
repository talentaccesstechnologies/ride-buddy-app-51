import React from 'react';

interface Props {
  children: React.ReactNode;
}

const MobileDeviceWrapper: React.FC<Props> = ({ children }) => {
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

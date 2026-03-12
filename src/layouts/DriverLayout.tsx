import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileDeviceWrapper from '@/components/cabyDriver/MobileDeviceWrapper';

const DriverLayout: React.FC = () => {
  return (
    <MobileDeviceWrapper>
      <Outlet />
    </MobileDeviceWrapper>
  );
};

export default DriverLayout;

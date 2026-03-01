import React, { useState, useEffect } from 'react';

interface CourseTimerProps {
  expiresAt: Date;
  onExpire: () => void;
}

const CourseTimer: React.FC<CourseTimerProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(100);

  useEffect(() => {
    const totalDuration = expiresAt.getTime() - Date.now();
    
    const interval = setInterval(() => {
      const remaining = expiresAt.getTime() - Date.now();
      
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setPercentage(0);
        onExpire();
        return;
      }

      setTimeLeft(Math.ceil(remaining / 1000));
      setPercentage((remaining / totalDuration) * 100);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isExpiring = percentage < 30;

  return (
    <div className="timer-bar mt-3">
      <div
        className={`timer-bar-fill ${isExpiring ? 'expiring' : ''}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default CourseTimer;

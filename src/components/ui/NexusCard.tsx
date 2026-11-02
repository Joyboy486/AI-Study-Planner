import React, { useRef, useState, useEffect } from 'react';

export type NexusGlowColor = 'emerald' | 'mint' | 'deep' | 'silver' | 'warning' | string;

interface NexusCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  tiltEffect?: boolean;
  maxTilt?: number; // degrees
  glareEffect?: boolean;
  floatingBadge?: React.ReactNode;
  glowColor?: NexusGlowColor;
  className?: string;
  contentClassName?: string;
}

export const NexusCard: React.FC<NexusCardProps> = ({
  children,
  tiltEffect = true,
  maxTilt = 6,
  glareEffect = true,
  floatingBadge,
  glowColor = 'emerald',
  className = '',
  contentClassName = '',
  style = {},
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Detect touch-only devices to avoid jank on mobile
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEffect || isTouchDevice || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setRotate({ x: rotateX, y: rotateY });
    setIsHovered(true);

    if (glareEffect) {
      setGlare({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.16,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!tiltEffect || isTouchDevice) return;
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const isPresetColor = ['emerald', 'mint', 'deep', 'silver', 'warning', 'violet', 'cyan'].includes(glowColor);

  const glowShadows: Record<string, string> = {
    emerald: 'hover:shadow-[0_16px_36px_-10px_rgba(0,214,143,0.25)] hover:border-[#00D68F]/50',
    mint: 'hover:shadow-[0_16px_36px_-10px_rgba(100,255,202,0.28)] hover:border-[#64FFCA]/60',
    deep: 'hover:shadow-[0_16px_36px_-10px_rgba(0,143,98,0.3)] hover:border-[#008F62]/60',
    silver: 'hover:shadow-[0_16px_36px_-10px_rgba(220,231,226,0.18)] hover:border-[#DCE7E2]/40',
    warning: 'hover:shadow-[0_16px_36px_-10px_rgba(255,200,87,0.22)] hover:border-[#FFC857]/50',
    violet: 'hover:shadow-[0_16px_36px_-10px_rgba(0,214,143,0.22)] hover:border-[#00D68F]/50',
    cyan: 'hover:shadow-[0_16px_36px_-10px_rgba(100,255,202,0.22)] hover:border-[#64FFCA]/50',
  };

  const dynamicGlowStyle: React.CSSProperties =
    !isPresetColor && isHovered
      ? {
          boxShadow: `0 16px 36px -10px ${glowColor}`,
          borderColor: glowColor,
        }
      : {};

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:
          !isTouchDevice && tiltEffect
            ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
            : undefined,
        transition:
          rotate.x === 0 && rotate.y === 0
            ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease'
            : 'box-shadow 0.3s ease',
        ...dynamicGlowStyle,
        ...style,
      }}
      className={`
        relative rounded-2xl bg-[#0D1713]/85 backdrop-blur-xl
        border border-[rgba(100,255,202,0.16)]
        shadow-xl shadow-black/60
        ${isPresetColor ? glowShadows[glowColor] : 'hover:border-[#00D68F]/50'}
        transition-all duration-300
        preserve-3d
        ${className}
      `}
      {...props}
    >
      {/* Subtle metallic top hairline highlight */}
      <div
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(100,255,202,0.25)] to-transparent pointer-events-none rounded-t-2xl"
        aria-hidden="true"
      />

      {/* Pointer-responsive radial mint glare spotlight layer */}
      {glareEffect && !isTouchDevice && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(100, 255, 202, ${glare.opacity}), transparent)`,
            opacity: glare.opacity > 0 ? 1 : 0,
          }}
          aria-hidden="true"
        />
      )}

      {/* Optional decorative floating badge */}
      {floatingBadge && (
        <div className="absolute -top-3 -right-3 z-20 pointer-events-none animate-float">
          {floatingBadge}
        </div>
      )}

      {/* Card Content */}
      <div className={`relative z-10 w-full h-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

import React, { useRef, useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface NexusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isSuccess?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  halo?: boolean;
  tooltip?: string;
  tiltOnHover?: boolean;
}

export const NexusButton: React.FC<NexusButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isSuccess = false,
  icon,
  iconPosition = 'left',
  halo = false,
  tooltip,
  tiltOnHover = true,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [magneticOffset, setMagneticOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    if (!isTouchDevice) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Magnetic attraction bounded to ±6px
      const magX = Math.max(-6, Math.min(6, (x - centerX) * 0.16));
      const magY = Math.max(-6, Math.min(6, (y - centerY) * 0.16));
      setMagneticOffset({ x: magX, y: magY });

      if (tiltOnHover && variant === 'primary') {
        const tiltX = ((y - centerY) / centerY) * -5;
        const tiltY = ((x - centerX) / centerX) * 5;
        setTilt({ x: tiltX, y: tiltY });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setMagneticOffset({ x: 0, y: 0 });
  };

  // Base sizing
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'text-xs py-1.5 px-3 rounded-lg gap-1.5',
    md: 'text-xs sm:text-sm py-2.5 px-4 rounded-xl gap-2 font-semibold',
    lg: 'text-sm py-3 px-6 rounded-xl gap-2.5 font-bold',
  };

  const iconSizeClasses: Record<ButtonSize, string> = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2.5 rounded-xl',
    lg: 'p-3 rounded-xl',
  };

  // Variants in Cyber Emerald language
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = `
        relative overflow-hidden text-[#050807] font-extrabold tracking-tight
        bg-gradient-to-r from-[#008F62] via-[#00D68F] to-[#64FFCA]
        hover:from-[#00A872] hover:via-[#22E5A1] hover:to-[#88FFD8]
        shadow-[0_4px_18px_rgba(0,214,143,0.32)] hover:shadow-[0_8px_26px_rgba(100,255,202,0.45)]
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200
        border border-[rgba(255,255,255,0.4)]
      `;
      break;

    case 'secondary':
      variantClasses = `
        relative overflow-hidden text-[#F3FFF9] font-medium
        bg-[#0D1713]/85 hover:bg-[#12221A]
        border border-[rgba(100,255,202,0.22)] hover:border-[#64FFCA]/70
        shadow-[0_4px_14px_rgba(0,0,0,0.5)] hover:shadow-[0_6px_20px_rgba(0,214,143,0.22)]
        hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200
      `;
      break;

    case 'ghost':
      variantClasses = `
        text-[#91A69B] hover:text-[#F3FFF9]
        bg-transparent hover:bg-[#12221A]/60
        hover:border-[rgba(100,255,202,0.15)] border border-transparent
        active:scale-[0.97] transition-all duration-150
      `;
      break;

    case 'danger':
      variantClasses = `
        text-[#FF647C] font-semibold
        bg-[#FF647C]/10 hover:bg-[#FF647C]/20
        border border-[#FF647C]/25 hover:border-[#FF647C]/50
        shadow-sm hover:shadow-[0_4px_14px_rgba(255,100,124,0.18)]
        active:scale-[0.98] transition-all duration-200
      `;
      break;

    case 'icon':
      variantClasses = `
        text-[#DCE7E2] hover:text-[#64FFCA]
        bg-[#0D1713]/85 hover:bg-[#12221A]
        border border-[rgba(100,255,202,0.18)] hover:border-[#00D68F]/60
        shadow-sm hover:shadow-[0_0_15px_rgba(0,214,143,0.2)]
        active:scale-95 transition-all duration-200
      `;
      break;
  }

  const isDisabled = disabled || isLoading;

  const magneticStyle: React.CSSProperties =
    !isTouchDevice && (variant === 'primary' || variant === 'secondary')
      ? {
          transform: `perspective(600px) translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${
            isHovered && variant === 'primary' ? 'translateY(-2px)' : ''
          }`,
          transition: isHovered
            ? 'transform 0.08s ease-out, box-shadow 0.2s ease, border-color 0.2s ease'
            : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
        }
      : {};

  return (
    <button
      ref={buttonRef}
      disabled={isDisabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      title={tooltip}
      style={magneticStyle}
      className={`
        inline-flex items-center justify-center select-none cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D68F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050807]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variant === 'icon' ? iconSizeClasses[size] : sizeClasses[size]}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {/* Metallic Inner Highlight for Primary */}
      {variant === 'primary' && (
        <span
          className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]"
          aria-hidden="true"
        />
      )}

      {/* Moving Light Shimmer Sweep for Primary CTA */}
      {variant === 'primary' && !isDisabled && (
        <span
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]"
          aria-hidden="true"
        >
          <span
            className="absolute -top-1/2 -bottom-1/2 w-12 bg-white/35 blur-sm animate-shimmer"
            style={{ transform: 'rotate(25deg)' }}
          />
        </span>
      )}

      {/* Dynamic Cursor Spotlight for Secondary Glass */}
      {variant === 'secondary' && isHovered && !isDisabled && (
        <span
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-100 rounded-[inherit]"
          style={{
            background: `radial-gradient(circle 60px at ${coords.x}px ${coords.y}px, rgba(100, 255, 202, 0.16), transparent)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Optional Pulsing Luminous Emerald Halo */}
      {halo && !isDisabled && (
        <span
          className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#00D68F] to-[#64FFCA] opacity-35 blur-md -z-10 animate-emerald-glow"
          aria-hidden="true"
        />
      )}

      {/* Content */}
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : isSuccess ? (
        <span className="flex items-center gap-1.5 text-current">
          <Check className="w-4 h-4 text-current shrink-0" />
          <span>Success</span>
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
              {icon}
            </span>
          )}
          {children && <span className="truncate">{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

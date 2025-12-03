import React from 'react';

export interface SpookyFloatingBonesProps {
  count?: number;
  className?: string;
}

/**
 * Decorative floating bone fragments for ambient spooky effect
 * 
 * @example
 * ```tsx
 * <SpookyFloatingBones count={3} />
 * ```
 */
export const SpookyFloatingBones: React.FC<SpookyFloatingBonesProps> = ({ 
  count = 3,
  className = ''
}) => {
  const bones = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 80 + 10}%`,
    top: `${Math.random() * 80 + 10}%`,
    delay: `${Math.random() * 3}s`,
    duration: `${6 + Math.random() * 4}s`,
  }));

  return (
    <>
      {bones.map((bone) => (
        <svg
          key={bone.id}
          className={`spooky-float-bone ${className}`}
          style={{
            left: bone.left,
            top: bone.top,
            animationDelay: bone.delay,
            animationDuration: bone.duration,
          }}
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 20h20M15 15l10 10M15 25l10-10"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.3"
          />
          <circle cx="10" cy="20" r="3" fill="currentColor" opacity="0.3" />
          <circle cx="30" cy="20" r="3" fill="currentColor" opacity="0.3" />
        </svg>
      ))}
    </>
  );
};

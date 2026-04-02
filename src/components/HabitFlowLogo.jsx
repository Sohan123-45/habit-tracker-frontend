import React from 'react';

/**
 * HabitFlow Logo — A stylized flame with a flowing streak tail.
 * Represents habit streaks (fire) + continuous flow (wave).
 *
 * @param {number}  size      — Height in px (default 36)
 * @param {boolean} withText  — Whether to render the "HabitFlow" wordmark
 * @param {string}  className — Extra CSS class names
 */
const HabitFlowLogo = ({ size = 36, withText = true, className = '' }) => {
  const id = React.useId();

  return (
    <span
      className={`habitflow-logo ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="HabitFlow logo"
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* Main flame gradient */}
          <linearGradient id={`${id}-flame`} x1="32" y1="58" x2="32" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF4500" />
            <stop offset="40%" stopColor="#FF8C00" />
            <stop offset="75%" stopColor="#FFB347" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>

          {/* Inner flame gradient */}
          <linearGradient id={`${id}-inner`} x1="32" y1="58" x2="32" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0.55 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Circle background gradient */}
          <radialGradient id={`${id}-bg`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,140,0,0.15)" />
            <stop offset="100%" stopColor="rgba(255,140,0,0.03)" />
          </radialGradient>
        </defs>

        {/* Background circle */}
        <circle cx="32" cy="32" r="30" fill={`url(#${id}-bg)`} stroke="rgba(255,160,50,0.12)" strokeWidth="1" />

        {/* Main flame shape */}
        <g filter={`url(#${id}-glow)`}>
          <path
            d="M32 8
               C28 16, 16 22, 16 36
               C16 46, 22 54, 32 56
               C42 54, 48 46, 48 36
               C48 22, 36 16, 32 8Z"
            fill={`url(#${id}-flame)`}
          />
          
          {/* Inner flame - bright core */}
          <path
            d="M32 24
               C30 30, 24 34, 24 42
               C24 48, 27 52, 32 53
               C37 52, 40 48, 40 42
               C40 34, 34 30, 32 24Z"
            fill={`url(#${id}-inner)`}
            opacity="0.9"
          />

          {/* Brightest center */}
          <ellipse cx="32" cy="46" rx="5" ry="6" fill="#FFF3D4" opacity="0.5" />
        </g>

        {/* Flow streak — the swoosh at the bottom representing continuity */}
        <path
          d="M14 50 Q20 44, 28 48 Q36 52, 44 44 Q48 40, 52 42"
          stroke="rgba(255,179,71,0.5)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        >
          <animate
            attributeName="d"
            dur="4s"
            repeatCount="indefinite"
            values="
              M14 50 Q20 44, 28 48 Q36 52, 44 44 Q48 40, 52 42;
              M14 48 Q20 46, 28 46 Q36 48, 44 46 Q48 44, 52 44;
              M14 50 Q20 44, 28 48 Q36 52, 44 44 Q48 40, 52 42
            "
          />
        </path>
      </svg>

      {withText && (
        <span
          style={{
            fontSize: `${size * 0.55}px`,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #FF8C00 0%, #FFB347 50%, #FF6B00 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}
        >
          HabitFlow
        </span>
      )}
    </span>
  );
};

export default HabitFlowLogo;

interface LogoProps {
  size?: number
}

export default function Logo({ size = 36 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-label="Dads Can't Beatbox"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="logoLabelGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e07070"/>
          <stop offset="1" stopColor="#e5a04a"/>
        </linearGradient>
        <style>{`
          .logo-vinyl-disc { animation: logo-spin 8s linear infinite; transform-origin: 16px 16px; }
          @keyframes logo-spin { to { transform: rotate(360deg); } }
        `}</style>
      </defs>

      {/* Outer disc with grooves */}
      <circle className="logo-vinyl-disc" cx="16" cy="16" r="15" fill="#1a1a24"/>

      {/* Groove lines */}
      <circle className="logo-vinyl-disc" cx="16" cy="16" r="13.5" fill="none" stroke="#2a2a34" strokeWidth="0.4"/>
      <circle className="logo-vinyl-disc" cx="16" cy="16" r="12" fill="none" stroke="#2a2a34" strokeWidth="0.4"/>
      <circle className="logo-vinyl-disc" cx="16" cy="16" r="10.5" fill="none" stroke="#2a2a34" strokeWidth="0.4"/>
      <circle className="logo-vinyl-disc" cx="16" cy="16" r="9" fill="none" stroke="#2a2a34" strokeWidth="0.4"/>
      <circle className="logo-vinyl-disc" cx="16" cy="16" r="7.5" fill="none" stroke="#2a2a34" strokeWidth="0.4"/>

      {/* Center label */}
      <circle className="logo-vinyl-disc" cx="16" cy="16" r="6" fill="url(#logoLabelGradient)"/>

      {/* DCB text on label */}
      <text
        className="logo-vinyl-disc"
        x="16"
        y="18"
        textAnchor="middle"
        fontSize="3.5"
        fontWeight="bold"
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        DCB
      </text>

      {/* Center spindle */}
      <circle cx="16" cy="16" r="1.5" fill="#1a1a24"/>
      <circle cx="16" cy="16" r="0.8" fill="#5db8a8"/>

      {/* Tonearm */}
      <line className="logo-vinyl-disc" x1="23" y1="6" x2="18" y2="13" stroke="#5db8a8" strokeWidth="1.2" strokeLinecap="round"/>
      <circle className="logo-vinyl-disc" cx="23" cy="6" r="1.8" fill="none" stroke="#5db8a8" strokeWidth="0.9"/>
    </svg>
  )
}

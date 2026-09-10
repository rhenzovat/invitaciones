/** Logo del sidebar: círculo con icono genérico de panel (cuadrícula). */
export default function MatxLogo({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width="42"
      height="42"
      aria-hidden
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      <circle cx="25" cy="25" r="23" fill="url(#logoGradient)" />

      {/* Icono genérico: panel / cuadrícula (admin) */}
      <g fill="#ffffff">
        <rect x="14" y="14" width="9" height="9" rx="2" />
        <rect x="27" y="14" width="9" height="9" rx="2" />
        <rect x="14" y="27" width="9" height="9" rx="2" />
        <rect x="27" y="27" width="9" height="9" rx="2" />
      </g>
    </svg>
  );
}

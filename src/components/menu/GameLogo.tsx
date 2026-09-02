export function GameLogo() {
  return (
    <svg className="site-header__logo" viewBox="0 0 100 100" role="img" aria-label="Следоку">
      <rect x="4" y="4" width="92" height="92" rx="14" fill="none" stroke="#2a2a2a" strokeWidth={6} />
      <line x1="50" y1="10" x2="50" y2="90" stroke="#2a2a2a" strokeWidth={5} strokeLinecap="round" />
      <line x1="10" y1="50" x2="90" y2="50" stroke="#2a2a2a" strokeWidth={5} strokeLinecap="round" />
      <line x1="33" y1="33" x2="84" y2="84" stroke="#2a2a2a" strokeWidth={9} strokeLinecap="round" />
      <circle cx="22" cy="22" r="15" fill="#faf8f4" stroke="#2a2a2a" strokeWidth={6} />
      <g stroke="#b91c1c" strokeWidth={4} strokeLinecap="round">
        <line x1="15" y1="15" x2="29" y2="29" />
        <line x1="29" y1="15" x2="15" y2="29" />
      </g>
    </svg>
  );
}

const Logo = () => {
  return (
    <svg viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg">
      <line x1="60" y1="60" x2="240" y2="220" />
      <line x1="240" y1="60" x2="60" y2="220" />
      <rect x="62" y="100" width="52" height="52" />
      <circle cx="238" cy="126" r="27" />
      <g transform="translate(150,18)">
        <line x1="0" y1="52" x2="0" y2="8" />
      </g>
    </svg>
  );
};

export default Logo;
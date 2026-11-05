const drawings = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20v-1a7 7 0 0 1 14 0v1" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="m3 3 18 18M10 5.2A11 11 0 0 1 12 5c6.4 0 10 7 10 7a19 19 0 0 1-3.3 4.2M6.1 6.9A20 20 0 0 0 2 12s3.6 7 10 7c1.7 0 3.1-.4 4.5-1.1M9 12a3 3 0 0 0 3 3" />
    </>
  ),
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  pin: (
    <>
      <path d="M19.5 10c0 5.2-7.5 11-7.5 11s-7.5-5.8-7.5-11a7.5 7.5 0 1 1 15 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  compare: (
    <>
      <rect x="3" y="5" width="7" height="14" rx="1.5" />
      <rect x="14" y="5" width="7" height="14" rx="1.5" />
    </>
  ),
  route: (
    <>
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M7 6h8a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z" />,
};

export default function AuthIcon({ name }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {drawings[name]}
    </svg>
  );
}

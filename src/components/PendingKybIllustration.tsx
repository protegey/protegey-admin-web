/** Shield mascot inspecting a stack of paperwork through a magnifying glass — "KYB review in progress". */
export function PendingKybIllustration({ className = "h-40 w-40" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="110" cy="176" rx="76" ry="12" fill="currentColor" className="text-foreground/5" />

      {/* pending clock badge */}
      <g transform="translate(160,18)">
        <circle cx="16" cy="16" r="16" fill="#FBBF24" />
        <path d="M16 8v8l6 4" stroke="#0B1741" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* stack of documents */}
      <g transform="translate(30,96)">
        <rect x="6" y="10" width="70" height="46" rx="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" transform="rotate(-6 41 33)" />
        <rect x="0" y="0" width="70" height="46" rx="5" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
        <rect x="10" y="10" width="42" height="4" rx="2" fill="#0B1741" opacity="0.15" />
        <rect x="10" y="19" width="50" height="4" rx="2" fill="#0B1741" opacity="0.15" />
        <rect x="10" y="28" width="30" height="4" rx="2" fill="#0B1741" opacity="0.15" />
      </g>

      {/* mascot shield, tilted forward as if inspecting */}
      <g transform="translate(96,26)">
        <path d="M40 0c16 5 29 9 38 13 0 38-13 61-38 73-25-12-38-35-38-73 9-4 22-8 38-13z" fill="#0CB99E" />
        <path d="M40 0c16 5 29 9 38 13 0 38-13 61-38 73V0z" fill="#0AA88F" />
        <circle cx="27" cy="42" r="4.5" fill="#0B1741" />
        <circle cx="53" cy="42" r="4.5" fill="#0B1741" />
        <path d="M28 58c7 5 17 5 24 0" stroke="#0B1741" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>

      {/* magnifying glass held toward the documents */}
      <g transform="translate(78,90) rotate(-18)">
        <circle cx="14" cy="14" r="13" fill="none" stroke="#0B1741" strokeWidth="4" />
        <line x1="23.5" y1="23.5" x2="36" y2="36" stroke="#0B1741" strokeWidth="5" strokeLinecap="round" />
        <circle cx="14" cy="14" r="9" fill="#0CB99E" opacity="0.25" />
      </g>
    </svg>
  );
}

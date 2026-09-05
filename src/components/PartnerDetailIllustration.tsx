/** Shield mascot next to a folder — used as the header accent on the partner detail screen. */
export function PartnerDetailIllustration({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="0" width="96" height="96" rx="20" fill="#0CB99E" fillOpacity="0.12" />
      <g transform="translate(18,16)">
        <path d="M22 0c9 3 16 5 21 7 0 21-7 34-21 41-14-7-21-20-21-41 5-2 12-4 21-7z" fill="#0CB99E" />
        <path d="M22 0c9 3 16 5 21 7 0 21-7 34-21 41V0z" fill="#0AA88F" />
        <circle cx="15" cy="24" r="2.6" fill="#0B1741" />
        <circle cx="29" cy="24" r="2.6" fill="#0B1741" />
        <path d="M15.5 32c3 2.4 8 2.4 11 0" stroke="#0B1741" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
      <g transform="translate(50,46) rotate(-8)">
        <rect x="0" y="6" width="30" height="22" rx="3" fill="#FFFFFF" stroke="#0B1741" strokeWidth="2" />
        <path d="M0 10h11l3-4h8l3 4h5" stroke="#0B1741" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

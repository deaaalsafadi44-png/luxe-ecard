export function InvitationNoise({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[1] invitation-noise ${className}`}
      aria-hidden
    />
  );
}

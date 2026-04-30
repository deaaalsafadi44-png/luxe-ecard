export function InvitationPageSkeleton() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-royal-cream px-4 pb-14 pt-14 sm:px-6 md:px-8">
      <div className="pointer-events-none fixed inset-0 z-0 bg-royal-cream" aria-hidden />
      <div className="relative z-10 mx-auto max-w-5xl animate-pulse">
        <div className="overflow-hidden rounded-3xl border border-royal-gold/25 bg-white/60 shadow-xl backdrop-blur-sm">
          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:justify-between">
              <div className="min-w-0 flex-1 space-y-4">
                <div className="h-3 w-24 rounded-full bg-royal-brown/15" />
                <div className="h-10 max-w-md rounded-xl bg-royal-brown/12" />
                <div className="h-4 max-w-sm rounded-lg bg-royal-brown/10" />
                <div className="h-16 max-w-lg rounded-2xl bg-royal-brown/10" />
              </div>
              <div className="h-36 rounded-2xl bg-royal-brown/10 md:w-[340px]" />
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="aspect-[4/3] min-h-[220px] rounded-2xl bg-royal-brown/10 sm:min-h-[300px]" />
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-royal-brown/10" />
                <div className="h-56 rounded-2xl bg-royal-brown/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-5 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-28 bg-secondary rounded-md" />
                <div className="h-4 w-16 bg-secondary rounded-full" />
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="text-center">
                  <div className="h-6 w-14 bg-secondary rounded-md mx-auto" />
                  <div className="h-3 w-12 bg-secondary rounded-md mt-1.5 mx-auto" />
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="h-3 w-12 bg-secondary rounded-md mb-1" />
                  <div className="w-full h-px bg-secondary" />
                </div>
                <div className="text-center">
                  <div className="h-6 w-14 bg-secondary rounded-md mx-auto" />
                  <div className="h-3 w-12 bg-secondary rounded-md mt-1.5 mx-auto" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-4 w-16 bg-secondary rounded-md" />
                ))}
              </div>
            </div>
            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2">
              <div className="h-4 w-20 bg-secondary rounded-md" />
              <div className="h-8 w-16 bg-secondary rounded-md" />
              <div className="h-10 w-28 bg-secondary rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

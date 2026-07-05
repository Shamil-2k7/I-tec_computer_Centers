"use client";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h2 className="text-2xl font-display font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}

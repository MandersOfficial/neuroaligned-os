export default function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

/** Full-area spinner for a page's own data loading (auth is already handled by the shell). */
export function InlineSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-sand-200/60 bg-sand-50/70 backdrop-blur-glass dark:border-olive-700/40 dark:bg-olive-700/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-baseline gap-2">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-olive-700 dark:text-sand-100">
            TryMe
          </h1>
          <span className="rounded-full bg-clay-400/20 px-2 py-0.5 text-xs font-medium text-clay-600 dark:text-clay-400">
            Virtual Try-On
          </span>
        </div>
        <p className="hidden text-sm text-sand-600 dark:text-sand-300 sm:block">
          See it on you before you buy
        </p>
      </div>
    </header>
  );
}

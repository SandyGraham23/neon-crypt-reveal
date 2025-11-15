import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/lucky-logo.svg" alt="Lucky Number Lottery" className="h-12 w-12 glow-pulse" />
            <div>
              <h1 className="text-2xl font-orbitron font-bold neon-text">
                Lucky Lottery
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Encrypt. Compete. Win.
              </p>
            </div>
          </div>

          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

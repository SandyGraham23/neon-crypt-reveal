import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export const CountdownFooter = () => {
  const [time, setTime] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-card border-2 border-primary/50 rounded-lg px-4 py-2 min-w-[80px] neon-border">
        <span className="text-3xl font-orbitron font-bold neon-text">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-muted-foreground mt-2 font-mono uppercase">
        {label}
      </span>
    </div>
  );

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-primary/30 bg-background/90 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary glow-pulse" />
            <span className="font-orbitron font-bold text-lg neon-text">
              Next Event Reveal
            </span>
          </div>
          
          <div className="flex gap-4">
            <TimeBlock value={time.days} label="Days" />
            <TimeBlock value={time.hours} label="Hours" />
            <TimeBlock value={time.minutes} label="Minutes" />
            <TimeBlock value={time.seconds} label="Seconds" />
          </div>
          
          <div className="text-sm text-muted-foreground font-mono">
            Block #847392
          </div>
        </div>
      </div>
    </footer>
  );
};

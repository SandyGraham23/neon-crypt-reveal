import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { PredictionGrid } from "@/components/PredictionGrid";
import { CountdownFooter } from "@/components/CountdownFooter";
import { LotteryModal } from "@/components/LotteryModal";
import { LotteryStatus } from "@/components/LotteryStatus";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartLottery = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-32">
      <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <Header />

      <main className="pt-24">
        <Hero onStartLottery={handleStartLottery} />
        <LotteryStatus />
        <Features />
        <PredictionGrid onSelectEvent={() => {}} />
      </main>

      <CountdownFooter />

      <LotteryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <Toaster />
    </div>
  );
};

export default Index;

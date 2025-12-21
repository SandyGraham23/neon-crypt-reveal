import { useState } from "react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { PredictionGrid } from "@/components/PredictionGrid";
import { PredictionModal } from "@/components/PredictionModal";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface PredictionSlot {
  id: string;
  title: string;
  category: string;
  participants: number;
  status: "active" | "locked" | "revealed";
}

const Predictions = () => {
  const [selectedEvent, setSelectedEvent] = useState<PredictionSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectEvent = (event: PredictionSlot) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <StaggerContainer>
          <StaggerItem>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 border-2 border-secondary/30 mb-6"
              >
                <TrendingUp className="h-10 w-10 text-secondary" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 neon-text">Prediction Markets</h1>
              <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
                Submit encrypted predictions on future events. Your predictions remain private until the reveal.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <PredictionGrid onSelectEvent={handleSelectEvent} />
          </StaggerItem>
        </StaggerContainer>
      </div>

      <PredictionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        event={
          selectedEvent
            ? {
                id: selectedEvent.id,
                title: selectedEvent.title,
                category: selectedEvent.category,
              }
            : undefined
        }
      />
    </PageTransition>
  );
};

export default Predictions;

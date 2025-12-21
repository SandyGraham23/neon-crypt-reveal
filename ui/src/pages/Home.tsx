import { useNavigate } from "react-router-dom";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";

const Home = () => {
  const navigate = useNavigate();

  const handleStartLottery = () => {
    navigate("/lottery");
  };

  return (
    <PageTransition>
      <StaggerContainer>
        <StaggerItem>
          <Hero onStartLottery={handleStartLottery} />
        </StaggerItem>
        <StaggerItem>
          <Features />
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
};

export default Home;

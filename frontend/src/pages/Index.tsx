import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UploadSection from "@/components/UploadSection";
import VisualizationSection from "@/components/VisualizationSection";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import heroRoom from "@/assets/hero-room.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full animate-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '6s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-secondary/10 rounded-full animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-primary/5 rounded-full animate-pulse" style={{ animationDelay: '3s', animationDuration: '7s' }}></div>
        
        {/* Moving Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-accent/15 to-secondary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2.5s', animationDuration: '10s' }}></div>
        
        {/* Floating Squares */}
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-primary/5 rotate-45 animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/2 left-1/3 w-12 h-12 bg-accent/5 rotate-45 animate-pulse" style={{ animationDelay: '3.5s', animationDuration: '6s' }}></div>
      </div>

      <div className="relative z-10">
        <Header />
        
        {/* Hero with Background Image */}
        <div 
          className="relative bg-cover bg-center bg-no-repeat min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(253, 246, 239, 0.6), rgba(253, 246, 239, 0.6)), url(${heroRoom})`,
            backgroundPosition: 'center center',
            backgroundAttachment: 'scroll'
          }}
        >
          <HeroSection />
        </div>
        
        <div className="animate-fade-in hover-scale" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <UploadSection />
        </div>
        
        <div className="animate-scale-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          <VisualizationSection />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'both', transform: 'translateY(20px)' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;

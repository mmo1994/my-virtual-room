import { ArrowRight, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/auth/AuthDialog";

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleStartVisualizing = () => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    // If authenticated, scroll to upload section
    const uploadSection = document.querySelector('[data-section="upload"]');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSeeDemo = () => {
    // Scroll to demo section for everyone
    const demoSection = document.querySelector('[data-section="demo"]');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="w-full py-12 sm:py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="neu-badge inline-flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 mb-6 sm:mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground">AI-Powered Furniture Visualization</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2">
              Visualize Furniture in Your
              <span className="text-primary block">Real Spaces</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              Make confident design decisions with AI-powered visualization.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 px-4">
              <Button 
                variant="coral" 
                size="lg" 
                className="text-base sm:text-lg w-full sm:w-auto"
                onClick={handleStartVisualizing}
              >
                <Camera className="w-5 h-5" />
                <span>Start Visualizing</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="default" 
                size="lg" 
                className="text-base sm:text-lg w-full sm:w-auto"
                onClick={handleSeeDemo}
              >
                <span>See Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-muted-foreground px-4">
              <div className="flex items-center space-x-2">
                
                
              </div>
              <div className="flex items-center space-x-2">
                
                
              </div>
              <div className="flex items-center space-x-2">
                
                
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
};

export default HeroSection;
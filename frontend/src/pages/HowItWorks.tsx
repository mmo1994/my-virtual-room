import { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Camera, Sparkles, ShoppingBag, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Upload Your Room Photo",
      description: "Take a clear photo of your empty room or space that needs furnishing",
      icon: Upload,
      details: [
        "Use natural lighting for best results",
        "Capture the entire room in one shot",
        "Make sure the image is clear and well-lit",
        "Remove any existing furniture for better visualization"
      ],
      tip: "Pro tip: Stand in the doorway and capture the room from corner to corner for the best perspective."
    },
    {
      id: 2,
      title: "Describe Your Style",
      description: "Tell us about your preferred style, colors, and furniture preferences",
      icon: Camera,
      details: [
        "Choose from modern, traditional, minimalist, or eclectic styles",
        "Specify your color preferences",
        "Mention any specific furniture needs"
      ],
      tip: "Be specific about your preferences - the more details you provide, the better our AI can match your style."
    },
    {
      id: 3,
      title: "Select Furniture",
      description: "Browse and select furniture pieces from our curated collection",
      icon: ShoppingBag,
      details: [
        "Browse furniture by category (living room, bedroom, office)",
        "Filter by style, color, and price range",
        "See how each piece looks in similar rooms",
        "Add multiple pieces to create your complete look"
      ],
      tip: "Start with larger pieces like sofas and beds, then add smaller accent pieces."
    },
    {
      id: 4,
      title: "Generate Visualization",
      description: "Our AI creates a realistic visualization of your furnished room",
      icon: Sparkles,
      details: [
        "AI analyzes your room dimensions and lighting",
        "Places furniture in optimal positions",
        "Ensures proper scale and proportions",
        "Creates a photorealistic rendering"
      ],
      tip: "The AI considers room flow and functionality, not just aesthetics."
    },
    {
      id: 5,
      title: "Shop",
      description: "Purchase the furniture pieces directly from our retail partners",
      icon: CheckCircle,
      details: [
        "Click on any furniture piece to see details",
        "Purchase directly through our partner links"
      ],
      tip: "Save your visualizations to compare different furniture combinations before buying."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            How It Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your empty space into a beautifully furnished room in just 5 simple steps. 
            Our AI-powered platform makes interior design accessible to everyone.
          </p>
        </div>

        {/* Steps Overview */}
        <div className="mb-16">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {steps.map((step) => (
              <Button
                key={step.id}
                variant={activeStep === step.id ? "default" : "outline"}
                onClick={() => setActiveStep(step.id)}
                className="h-auto p-4 flex flex-col items-center space-y-2 min-w-[120px]"
              >
                <step.icon className="w-6 h-6" />
                <span className="text-sm font-medium">Step {step.id}</span>
              </Button>
            ))}
          </div>

          {/* Active Step Details */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                {(() => {
                  const currentStep = steps.find(s => s.id === activeStep);
                  if (currentStep) {
                    const IconComponent = currentStep.icon;
                    return <IconComponent className="w-12 h-12 text-primary mr-4" />;
                  }
                  return null;
                })()}
                <div>
                  <CardTitle className="text-2xl">
                    {steps.find(s => s.id === activeStep)?.title}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {steps.find(s => s.id === activeStep)?.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-foreground mb-4">What to do:</h4>
                  <ul className="space-y-3">
                    {steps.find(s => s.id === activeStep)?.details.map((detail, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="warm-card p-6">
                  <h4 className="font-semibold text-primary mb-3">💡 Helpful Tip</h4>
                  <p className="text-muted-foreground">
                    {steps.find(s => s.id === activeStep)?.tip}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                  disabled={activeStep === 1}
                >
                  Previous Step
                </Button>
                <Button
                  onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
                  disabled={activeStep === 5}
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Section */}
        <div className="text-center warm-card p-12 mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to Transform Your Space?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already created their dream rooms with our AI-powered platform.
          </p>
          <Button size="lg" className="px-8 py-4 text-lg" asChild>
            <Link to="/">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How accurate are the visualizations?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI creates highly realistic visualizations with 90%+ accuracy in scale, lighting, and proportions. 
                  The better your room photo, the more accurate the result.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I modify the furniture placement?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Currently, our AI automatically optimizes furniture placement for the best flow and functionality. 
                  Custom placement options are coming soon!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What room types are supported?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We support living rooms, bedrooms, home offices, dining rooms, and open-plan spaces. 
                  More room types are being added regularly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a cost to use the platform?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Creating visualizations is free! We earn a small commission when you purchase furniture 
                  through our retail partners, but this doesn't affect the prices you pay.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;
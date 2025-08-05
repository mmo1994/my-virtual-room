import { Camera, Brain, ExternalLink, ToggleLeft, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Features = () => {
  const features = [
    {
      id: "upload",
      icon: Camera,
      title: "Room Photo Upload",
      description: "Simply upload a photo of your space to begin the transformation. Our AI supports JPG, PNG, WebP, and HEIC formats up to 15MB.",
      status: "available"
    },
    {
      id: "ai-suggestions",
      icon: Brain,
      title: "AI Design Suggestions", 
      description: "Our advanced computer vision analyzes your room's dimensions, lighting, and style to automatically generate furniture arrangements tailored to your space.",
      status: "available"
    },
    {
      id: "furniture-links",
      icon: ExternalLink,
      title: "Direct Purchase Links",
      description: "Every suggested furniture piece links directly to our partner store, Vega, making it effortless to purchase items that perfectly fit your design.",
      status: "available"
    },
    {
      id: "before-after",
      icon: ToggleLeft,
      title: "Before & After View",
      description: "Instantly toggle between your original room photo and the AI-designed version. Compare side-by-side or use our interactive slider for seamless transitions.",
      status: "available"
    },

  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary mr-3 animate-pulse" />
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
                Powerful Features
              </h1>
              <Sparkles className="w-8 h-8 text-primary ml-3 animate-pulse" />
            </div>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Discover how Spacify's AI-powered technology transforms the way you visualize and design your living spaces.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8 lg:gap-12">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                const isComingSoon = feature.status === "coming-soon";
                
                return (
                  <div 
                    key={feature.id} 
                    className={`warm-card p-8 lg:p-12 ${isComingSoon ? 'opacity-75' : ''}`}
                  >
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      {/* Content */}
                      <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                        <div className="flex items-center mb-6">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-4 ${
                            isComingSoon 
                              ? 'bg-muted/50' 
                              : 'bg-primary/10'
                          }`}>
                            <IconComponent className={`w-8 h-8 ${
                              isComingSoon 
                                ? 'text-muted-foreground' 
                                : 'text-primary'
                            }`} />
                          </div>
                          <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                              {feature.title}
                            </h2>
                            {isComingSoon && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                Coming Soon
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                          {feature.description}
                        </p>
                        {!isComingSoon && (
                          <div className="flex items-center text-primary font-medium">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Available Now
                          </div>
                        )}
                      </div>

                      {/* Visual */}
                      <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                        <div className={`relative rounded-2xl p-8 ${
                          isComingSoon 
                            ? 'bg-muted/30' 
                            : 'bg-gradient-to-br from-primary/5 to-secondary/10'
                        } min-h-[200px] flex items-center justify-center`}>
                          <IconComponent className={`w-24 h-24 ${
                            isComingSoon 
                              ? 'text-muted-foreground/50' 
                              : 'text-primary/40'
                          }`} />
                          
                          {/* Decorative elements for non-coming-soon features */}
                          {!isComingSoon && (
                            <>
                              <div className="absolute top-4 right-4 w-3 h-3 bg-primary/20 rounded-full animate-pulse"></div>
                              <div className="absolute bottom-6 left-6 w-2 h-2 bg-secondary/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                              <div className="absolute top-1/2 right-8 w-1 h-1 bg-primary/40 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="warm-card p-8 lg:p-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Ready to Transform Your Space?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience the power of AI-driven interior design. Upload your room photo and see the magic happen in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="coral-button">
                  <Link to="/">
                    Start Designing Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/how-it-works">
                    Learn How It Works
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features; 
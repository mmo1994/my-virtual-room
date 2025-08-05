import { ArrowRight, Sparkles, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const About = () => {
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
                About Spacify
              </h1>
              <Sparkles className="w-8 h-8 text-primary ml-3 animate-pulse" />
            </div>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Revolutionizing interior design through cutting-edge AI technology that transforms how people visualize furniture in their living spaces.
            </p>
            <div className="warm-card p-8 text-left">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
                <Target className="w-6 h-6 text-primary mr-3" />
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To eliminate the guesswork in furniture shopping by providing an intelligent, AI-powered platform that allows users to see exactly how pieces will look and fit in their actual spaces before making a purchase decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                The Story Behind Spacify
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Born from the frustration of countless returns and design mistakes in the furniture industry
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="warm-card p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-6">The Problem We Solved</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Every year, billions of dollars worth of furniture gets returned because it doesn't fit, doesn't match, or simply doesn't look right in the buyer's space. This creates frustration for consumers and massive costs for retailers.
                  </p>
                  <p>
                    Traditional furniture shopping relies on imagination and hope. Even with measurements, it's nearly impossible to envision how a piece will actually look in your unique space with your lighting, colors, and existing décor.
                  </p>
                  <p>
                    We realized that advanced computer vision and AI could bridge this gap, giving people the confidence to make informed design decisions.
                  </p>
                </div>
              </div>
              
              <div className="warm-card p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-6">Our Innovation</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Spacify combines cutting-edge AI image analysis with intuitive user experience design. Users simply upload a photo of their room and describe their style preferences.
                  </p>
                  <p>
                    Our proprietary algorithms analyze room dimensions, lighting conditions, existing décor, and style elements to generate realistic 2D furniture overlays that respect perspective and scale.
                  </p>
                  <p>
                    The result? A revolutionary "try before you buy" experience that reduces returns, increases satisfaction, and transforms how people approach interior design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Vision Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary mr-3" />
              Our Vision for the Future
            </h2>
            
            <div className="warm-card p-8 text-left mb-8">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Transforming Interior Design</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We envision a world where everyone can be their own interior designer, empowered by AI technology that understands both aesthetics and spatial dynamics. Spacify is just the beginning of this transformation.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Short-term Goals</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Expand to mobile and tablet platforms</li>
                    <li>• Add 3D and AR visualization capabilities</li>
                    <li>• Integrate with major furniture retailers</li>
                    <li>• Advanced room style analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Long-term Vision</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Full-room design automation</li>
                    <li>• Collaborative design tools</li>
                    <li>• Sustainability and eco-friendly options</li>
                    <li>• Global marketplace integration</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join us in revolutionizing how people experience and interact with interior design. Whether you're furnishing your first apartment or redesigning your dream home, Spacify makes it possible to see your vision before you invest.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="coral-button">
                  <Link to="/">
                    Try Spacify Now
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

export default About; 

import { useState, useRef } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
const defaultRoomAfter = "/lovable-uploads/d3f0a3ef-a7e5-4109-9a57-54745712fdcf.png";
const defaultRoomBefore = "/lovable-uploads/87681e24-2dd6-48f3-aa07-26153794e68a.png";
import sofaImage from "@/assets/furniture-sofa.jpg";
import coffeeTableImage from "@/assets/furniture-coffee-table.jpg";
import floorLampImage from "@/assets/furniture-floor-lamp.jpg";
interface FurnitureItem {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image: string;
  retailer: string;
  description: string;
}

interface VisualizationSectionProps {
  data?: {
    originalImageUrl: string;
    generatedImageUrl: string;
    processedFurniture: Array<{
      furnitureId: string;
      positionX: number;
      positionY: number;
      scale: number;
      rotation: number;
    }>;
  } | null;
}

const VisualizationSection = ({ data }: VisualizationSectionProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use generated data if available, otherwise use default images
  const roomAfter = data?.generatedImageUrl || defaultRoomAfter;
  const roomBefore = data?.originalImageUrl || defaultRoomBefore;
  const hasGeneratedData = !!data;

  // Mock furniture data with realistic images
  const furnitureItems: FurnitureItem[] = [{
    id: "1",
    name: "Modern Sectional Sofa",
    x: 25,
    y: 60,
    width: 200,
    height: 100,
    image: "/lovable-uploads/22856276-c778-4b2c-b740-06c309881dd9.png",
    retailer: "Vega",
    description: "Comfortable gray sectional perfect for modern living rooms"
  }, {
    id: "2",
    name: "Coffee Table",
    x: 35,
    y: 75,
    width: 80,
    height: 40,
    image: "/lovable-uploads/31e72440-858d-45ea-bbd8-0b22a4c1e80f.png",
    retailer: "Vega",
    description: "Round coffee table with nesting stools"
  }, {
    id: "3",
    name: "Floor Lamp",
    x: 70,
    y: 45,
    width: 20,
    height: 60,
    image: "/lovable-uploads/d64b329d-5ab6-4e5a-bdab-73caae8cad9c.png",
    retailer: "Vega",
    description: "Modern arc floor lamp with warm LED"
  }];
  const handleMouseDown = () => {
    setIsDragging(true);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleTouchStart = () => {
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage = (e.touches[0].clientX - rect.left) / rect.width * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  const handleContainerClick = (e: React.MouseEvent) => {
    if (isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create click ripple effect
    setClickPosition({
      x,
      y
    });
    setTimeout(() => setClickPosition(null), 600);

    // Animate slider to click position
    const percentage = x / rect.width * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };
  return <section className="w-full py-20 relative overflow-hidden">
      {/* Separated floating background elements - moved behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Large floating gradient orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gradient-to-br from-primary/3 to-primary/8 animate-pulse blur-xl" style={{animationDelay: '0s', animationDuration: '8s'}}></div>
        <div className="absolute top-1/3 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-secondary/4 to-accent/6 animate-pulse blur-2xl" style={{animationDelay: '2s', animationDuration: '12s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-56 h-56 rounded-full bg-gradient-to-br from-accent/2 to-primary/5 animate-pulse blur-3xl" style={{animationDelay: '4s', animationDuration: '10s'}}></div>
        <div className="absolute bottom-1/3 right-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary/4 to-secondary/6 animate-pulse blur-xl" style={{animationDelay: '1s', animationDuration: '6s'}}></div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary mr-3 animate-pulse" />
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                {hasGeneratedData ? "Your Room Transformation" : "Before & After Magic"}
              </h2>
              <Sparkles className="w-8 h-8 text-primary ml-3 animate-pulse" />
            </div>
            <p className="text-lg text-muted-foreground">
              {hasGeneratedData 
                ? "Your room has been styled with AI-powered furniture placement" 
                : "Upload a room photo above to see your personalized transformation"
              }
            </p>
          </div>

          {/* Before/After Slider */}
          <div className="warm-card p-6 mb-8" data-section="visualization">
            <div ref={containerRef} className="relative group w-full aspect-video rounded-xl overflow-hidden cursor-ew-resize select-none" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onClick={handleContainerClick}>
              {/* After Image (Left side - base layer) */}
              <div className="absolute inset-0">
                <img src={roomAfter} alt={hasGeneratedData ? "Your styled room" : "Furnished room after decoration"} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium animate-fade-in">
                  {hasGeneratedData ? "Styled" : "After"}
                </div>
              </div>

              {/* Before Image (Right side - revealed by slider) */}
              <div className="absolute inset-0 transition-all duration-300 ease-out" style={{
              clipPath: `inset(0 0 0 ${sliderPosition}%)`
            }}>
                <img src={roomBefore} alt={hasGeneratedData ? "Your original room" : "Empty room before furniture"} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-background/90 px-3 py-1 rounded-full text-sm font-medium animate-fade-in">
                  {hasGeneratedData ? "Original" : "Before"}
                </div>

              </div>

              {/* Click Ripple Effect */}
              {clickPosition && <div className="absolute pointer-events-none z-30" style={{
              left: clickPosition.x - 25,
              top: clickPosition.y - 25
            }}>
                  <div className="w-12 h-12 rounded-full bg-primary/30 animate-ping"></div>
                  <div className="absolute inset-0 w-12 h-12 rounded-full bg-primary/20 animate-pulse"></div>
                </div>}

              {/* Slider Handle */}
              <div className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg cursor-ew-resize z-10 transition-all duration-300 ease-out" style={{
              left: `${sliderPosition}%`,
              transform: 'translateX(-50%)'
            }} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                  <div className="w-1 h-4 bg-primary-foreground rounded-full"></div>
                  <div className="w-1 h-4 bg-primary-foreground rounded-full ml-1"></div>
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 px-4 py-2 rounded-full text-sm font-medium animate-bounce transition-opacity duration-500 group-hover:opacity-0">
                {hasGeneratedData 
                  ? "Click anywhere or drag to compare your transformation ✨" 
                  : "Click anywhere or drag to reveal transformation ✨"
                }
              </div>

            </div>
          </div>

          {/* Auto Slider Controls */}
          <div className="flex items-center justify-center mb-8">
            <div className="warm-card px-6 py-3">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-muted-foreground">Quick Preview:</span>
                <Button onClick={() => setSliderPosition(100)} variant="default" size="sm">
                  {hasGeneratedData ? "Original" : "Before"}
                </Button>
                <Button onClick={() => setSliderPosition(50)} variant="default" size="sm">
                  Split
                </Button>
                <Button onClick={() => setSliderPosition(0)} variant="default" size="sm">
                  {hasGeneratedData ? "Styled" : "After"}
                </Button>
              </div>
            </div>
          </div>

          {/* Furniture List */}
          {hasGeneratedData ? (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Generated Furniture Placement</h3>
              <div className="warm-card p-6">
                <p className="text-muted-foreground mb-4">
                  Your room has been styled with AI-powered furniture placement. The generated layout considers your style preferences and room dimensions.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.processedFurniture.map((item, index) => (
                    <div key={item.furnitureId} className="bg-background/50 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">Furniture Item {index + 1}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Position: ({item.positionX}%, {item.positionY}%)</p>
                        <p>Scale: {item.scale}x</p>
                        <p>Rotation: {item.rotation}°</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">Furniture in This Room</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {furnitureItems.map(item => <div key={item.id} className="warm-card p-6 group cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg active:scale-95" onClick={() => setSelectedItem(item)}>
                    <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{item.retailer}</span>
                        <ExternalLink className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedItem(null)}>
        <div className="warm-card p-8 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{selectedItem.name}</h3>
              <p className="text-muted-foreground mb-4">{selectedItem.description}</p>
              
              <div className="space-y-3">
                <Button 
                  variant="coral" 
                  size="default" 
                  className="w-full"
                  onClick={() => window.open('https://vega.am/ru', '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Shop at {selectedItem.retailer}</span>
                </Button>
                <Button onClick={() => setSelectedItem(null)} variant="ghost" size="default" className="w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>}
    </section>;
};
export default VisualizationSection;

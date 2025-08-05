import { useState, useRef, useEffect } from "react";
import { Upload, Image, AlertCircle, Check, Armchair, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FurnitureMenu from "./furniture/FurnitureMenu";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/auth/AuthDialog";
import { apiService } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const UploadSection = () => {
  const { isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [styleDescription, setStyleDescription] = useState("");
  const [furnitureMenuOpen, setFurnitureMenuOpen] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<Array<{
    id: string;
    name: string;
    image: string;
  }>>([]);
  const [shouldScroll, setShouldScroll] = useState(false);
  const filenameRef = useRef<HTMLParagraphElement>(null);
  const [visualizationResult, setVisualizationResult] = useState<{
    url: string;
    originalUrl?: string;
  } | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  const checkAuthentication = () => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return false;
    }
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!checkAuthentication()) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkAuthentication()) {
      e.target.value = ''; // Reset the input
      return;
    }
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const maxSize = 15 * 1024 * 1024; // 15MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    
    if (file.size > maxSize) {
      toast.error('File size must be under 15MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WebP, or HEIC file');
      return;
    }
    
    setUploadedFile(file);
    toast.success('File uploaded successfully!');
  };

  // Check if filename overflows and needs scrolling
  useEffect(() => {
    if (uploadedFile && filenameRef.current) {
      const checkOverflow = () => {
        const container = filenameRef.current?.parentElement;
        if (container && filenameRef.current) {
          const containerWidth = container.clientWidth - 24; // Account for padding
          const textWidth = filenameRef.current.scrollWidth;
          setShouldScroll(textWidth > containerWidth);
        }
      };
      
      // Check immediately and on resize
      setTimeout(checkOverflow, 100); // Small delay to ensure DOM is updated
      window.addEventListener('resize', checkOverflow);
      
      return () => window.removeEventListener('resize', checkOverflow);
    }
  }, [uploadedFile]);

  const handleAddFurniture = (item: {
    id: string;
    name: string;
    image: string;
  }) => {
    if (!checkAuthentication()) {
      setFurnitureMenuOpen(false);
      return;
    }
    
    if (!selectedFurniture.find(f => f.id === item.id)) {
      setSelectedFurniture(prev => [...prev, item]);
      toast.success(`${item.name} added to selection`);
    }
    setFurnitureMenuOpen(false);
  };

  const handleRemoveFurniture = (id: string) => {
    if (!checkAuthentication()) return;
    
    setSelectedFurniture(prev => prev.filter(f => f.id !== id));
    toast.success('Furniture removed from selection');
  };

  const handleGenerateVisualization = async () => {
    if (!checkAuthentication()) return;
    
    if (!uploadedFile || !styleDescription.trim()) {
      toast.error('Please upload a room photo and describe your style preferences');
      return;
    }
    
    if (selectedFurniture.length === 0) {
      toast.error('Please select at least one furniture item');
      return;
    }
    
    toast.loading('Uploading room image...', {
      id: 'generate-viz'
    });
    
    try {
      // First, upload the room image
      const uploadResult = await apiService.uploadRoomImage(uploadedFile);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Failed to upload room image');
      }
      
      toast.loading('Generating furniture visualization...', {
        id: 'generate-viz'
      });
      
      // Then generate the visualization
      const generateResult = await apiService.generateVisualization({
        roomImageId: uploadResult.data!.imageId,
        furnitureItems: selectedFurniture,
        styleDescription: styleDescription.trim()
      });
      
      if (!generateResult.success) {
        throw new Error(generateResult.message || 'Failed to generate visualization');
      }
      
      toast.success('Visualization generated successfully!', {
        id: 'generate-viz'
      });
      
      // Set the visualization result
      const baseUrl = 'http://localhost:3001';
      setVisualizationResult({
        url: `${baseUrl}${generateResult.data!.url}`,
        originalUrl: uploadedFile ? URL.createObjectURL(uploadedFile) : undefined
      });
      setShowVisualization(true);
      
    } catch (error) {
      console.error('Visualization error:', error);
      toast.error('Failed to generate visualization', {
        id: 'generate-viz'
      });
    }
  };

  const handleStyleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!checkAuthentication()) return;
    setStyleDescription(e.target.value);
  };

  const handleStyleButtonClick = (style: string) => {
    if (!checkAuthentication()) return;
    setStyleDescription(style.toLowerCase());
  };

  const handleAddFurnitureClick = () => {
    if (!checkAuthentication()) return;
    setFurnitureMenuOpen(true);
  };

  return (
    <>
      <section className="w-full py-20 bg-[var(--warm-gradient)]" data-section="upload">
        <div className="warm-card p-8 rounded-3xl max-w-5xl mx-auto px-8" style={{
          animation: 'slideUpSeparate 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, separatorPulse 4s infinite 1s',
          transform: 'translateY(40px)',
          opacity: '0'
        }}>
          {/* Glowing Separator Lines - Extended spacing */}
          <div className="absolute -top-28 sm:-top-32 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 blur-sm"></div>
          <div className="absolute -bottom-20 sm:-bottom-24 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 blur-sm"></div>
          <div className="max-w-4xl mx-auto py-[40px]">
            {/* Section Header */}
            <div className="text-center mb-12 px-0 mx-0 my-0 py-0">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 mx-0 px-0 py-px my-0">
                Upload Your Room
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {isAuthenticated 
                  ? "Start by uploading a photo of your room and describing your style preferences"
                  : "Sign up to start uploading room photos and creating amazing visualizations"
                }
              </p>
              
              {/* Action Buttons - Removed Add Furniture button */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {/* Space for other action buttons if needed */}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Area */}
              <div className="warm-card p-8 rounded-3xl">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-primary" />
                  Room Photo
                </h3>
                
                {!uploadedFile ? (
                  <div 
                    className={`upload-zone ${dragActive ? 'border-primary bg-[var(--overlay-bg)]' : ''} ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onDragEnter={isAuthenticated ? handleDrag : undefined}
                    onDragLeave={isAuthenticated ? handleDrag : undefined}
                    onDragOver={isAuthenticated ? handleDrag : undefined}
                    onDrop={isAuthenticated ? handleDrop : undefined}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-foreground mb-2">
                      {isAuthenticated ? "Drop your room photo here" : "Sign up to upload photos"}
                    </h4>
                    <p className="text-muted-foreground mb-4">
                      {isAuthenticated ? "or click to browse files" : "Create an account to get started"}
                    </p>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/heic" 
                      onChange={handleFileInput} 
                      className="hidden" 
                      id="file-upload"
                      disabled={!isAuthenticated}
                    />
                    <Button 
                      asChild={isAuthenticated} 
                      variant="coral" 
                      size="default"
                      disabled={!isAuthenticated}
                      onClick={!isAuthenticated ? checkAuthentication : undefined}
                    >
                      {isAuthenticated ? (
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      ) : (
                        <span>Sign Up to Upload</span>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      JPG, PNG, WebP, or HEIC • Max 15MB
                    </p>
                  </div>
                ) : (
                  <div className="border border-border rounded-3xl p-6 bg-[var(--overlay-bg)]">
                    <div className="flex items-center space-x-3 mb-4">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-foreground">File uploaded successfully</span>
                    </div>
                    <div className={`relative mb-4 bg-muted/30 rounded-md px-3 py-2 ${shouldScroll ? 'overflow-hidden' : ''}`}>
                      <p 
                        ref={filenameRef}
                        className={`text-sm text-muted-foreground ${shouldScroll ? 'whitespace-nowrap animate-scroll' : 'break-all'}`}
                      >
                        {uploadedFile.name} • {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setUploadedFile(null);
                        setShouldScroll(false);
                      }} 
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      Upload different image
                    </button>
                  </div>
                )}
              </div>

              {/* Style Description */}
              <div className="warm-card p-8 rounded-3xl">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                  Style Preferences
                </h3>
                
                <textarea 
                  value={styleDescription} 
                  onChange={handleStyleDescriptionChange}
                  placeholder={isAuthenticated 
                    ? "Describe your style preferences... (e.g., 'modern minimalist', 'cozy farmhouse', 'mid-century modern')"
                    : "Sign up to describe your style preferences..."
                  }
                  className={`neu-input w-full h-32 p-4 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isAuthenticated}
                  onClick={!isAuthenticated ? checkAuthentication : undefined}
                />
                
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Popular styles:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Modern Minimalist', 'Cozy Farmhouse', 'Mid-Century Modern', 'Scandinavian'].map(style => (
                      <Button 
                        key={style} 
                        onClick={() => handleStyleButtonClick(style)}
                        variant="default" 
                        size="sm"
                        disabled={!isAuthenticated}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Furniture Selection */}
            <div className="warm-card p-8 mt-8 rounded-3xl">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Armchair className="w-5 h-5 mr-2 text-primary" />
                Furniture Selection
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  onClick={handleAddFurnitureClick}
                  variant="outline" 
                  size="sm"
                  disabled={!isAuthenticated}
                >
                  <Armchair className="w-4 h-4 mr-2" />
                  {isAuthenticated ? "Add Furniture" : "Sign Up to Add Furniture"}
                </Button>
              </div>
              
              {selectedFurniture.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selected furniture items ({selectedFurniture.length}):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedFurniture.map(item => (
                      <div key={item.id} className="relative border border-border rounded-2xl p-4 bg-[var(--overlay-bg)] hover:bg-[var(--overlay-hover)] transition-colors">
                        <button 
                          onClick={() => handleRemoveFurniture(item.id)} 
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-white/90 border border-border/50 overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm font-medium text-foreground text-center">{item.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Armchair className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{isAuthenticated ? "No furniture selected yet" : "Sign up to select furniture"}</p>
                  <p className="text-sm">
                    {isAuthenticated 
                      ? "Add furniture items to visualize them in your room"
                      : "Create an account to add furniture and generate visualizations"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="text-center mt-8 mb-8">
              <Button
                disabled={!isAuthenticated || !uploadedFile || !styleDescription.trim() || selectedFurniture.length === 0}
                onClick={handleGenerateVisualization}
                variant="coral"
                size="lg"
                className="text-lg px-8 py-4 mt-8 mb-8 text-center break-words whitespace-normal leading-snug w-full sm:w-auto"
              >
                {isAuthenticated 
                  ? "Generate Furniture Visualization"
                  : "Sign Up to Generate Visualization"
                }
              </Button>
            </div>
          </div>
        </div>
        
        <FurnitureMenu 
          open={furnitureMenuOpen} 
          onOpenChange={setFurnitureMenuOpen} 
          onAddFurniture={handleAddFurniture} 
        />
      </section>
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      
      {/* Visualization Result Dialog */}
      <Dialog open={showVisualization} onOpenChange={setShowVisualization}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Your Styled Room</DialogTitle>
          </DialogHeader>
          
          {visualizationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Image */}
                {visualizationResult.originalUrl && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Original Room</h3>
                    <img 
                      src={visualizationResult.originalUrl} 
                      alt="Original room"
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                )}
                
                {/* Generated Image */}
                <div>
                  <h3 className="text-sm font-medium mb-2">With Furniture</h3>
                  <img 
                    src={visualizationResult.url} 
                    alt="Room with furniture"
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowVisualization(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = visualizationResult.url;
                    link.download = 'styled-room.jpg';
                    link.click();
                  }}
                >
                  Download Image
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadSection;
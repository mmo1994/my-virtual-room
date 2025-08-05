import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Armchair, 
  Search,
  Plus,
  X
} from 'lucide-react';

// Import furniture images
import sofaModern from '@/assets/furniture/sofa-modern.png';
import sofaNeutral from '@/assets/furniture/sofa-neutral.png';
import armchairLeather from '@/assets/furniture/armchair-leather.png';
import chairNeutral from '@/assets/furniture/chair-neutral.png';
import coffeeTable from '@/assets/furniture/coffee-table.png';
import tableDining from '@/assets/furniture/table-dining.png';
import sideTable from '@/assets/furniture/side-table.png';
import floorLamp from '@/assets/furniture/floor-lamp.png';
import tableLamp from '@/assets/furniture/table-lamp.png';
import bedQueen from '@/assets/furniture/bed-queen.png';
import nightstand from '@/assets/furniture/nightstand.png';
import dresser from '@/assets/furniture/dresser.png';
import officeChair from '@/assets/furniture/office-chair.png';
import desk from '@/assets/furniture/desk.png';
import bookshelf from '@/assets/furniture/bookshelf.png';
import tvStand from '@/assets/furniture/tv-stand.png';

interface FurnitureItem {
  id: string;
  name: string;
  image: string;
  category: string;
}

interface FurnitureMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFurniture?: (item: FurnitureItem) => void;
}

const furnitureItems: FurnitureItem[] = [
  // Living Room
  { id: 'sofa-1', name: 'Modern Sofa', image: '/lovable-uploads/7adc2304-b1d3-4933-bf4a-78b784a87b24.png', category: 'living' },
  { id: 'sofa-2', name: 'Neutral Sofa', image: sofaNeutral, category: 'living' },
  { id: 'armchair-1', name: 'Leather Armchair', image: '/lovable-uploads/94e616fa-2037-4802-98ad-22c97a8349b9.png', category: 'living' },
  { id: 'chair-1', name: 'Neutral Chair', image: chairNeutral, category: 'living' },
  { id: 'coffee-table', name: 'Coffee Table', image: coffeeTable, category: 'living' },
  { id: 'round-coffee-table', name: 'Round Coffee Table', image: '/lovable-uploads/5ada5843-ed84-4ab0-b0f1-1dd7c0c97530.png', category: 'living' },
  { id: 'side-table', name: 'Side Table', image: sideTable, category: 'living' },
  { id: 'tv-stand', name: 'TV Stand', image: tvStand, category: 'living' },
  { id: 'floor-lamp', name: 'Floor Lamp', image: '/lovable-uploads/69630eb6-2e4b-4cbb-80fd-641b190f29a0.png', category: 'living' },
  
  // Dining
  { id: 'dining-table', name: 'Dining Table', image: tableDining, category: 'dining' },
  { id: 'dining-table-set', name: 'Dining Table Set', image: '/lovable-uploads/f08af0d5-bcfb-445a-86e7-230f0987274a.png', category: 'dining' },
  { id: 'modern-dining-table', name: 'Modern Dining Table', image: '/lovable-uploads/f8145924-89f4-4d41-8da2-507042f0fa41.png', category: 'dining' },
  { id: 'elegant-dining-set', name: 'Elegant Dining Set', image: '/lovable-uploads/14762623-97d1-404a-8b9a-5c0ea1c9fc58.png', category: 'dining' },
  
  // Bedroom
  { id: 'bed-1', name: 'Queen Bed', image: bedQueen, category: 'bedroom' },
  { id: 'nightstand', name: 'Nightstand', image: nightstand, category: 'bedroom' },
  { id: 'dresser', name: 'Dresser', image: dresser, category: 'bedroom' },
  { id: 'table-lamp', name: 'Table Lamp', image: tableLamp, category: 'bedroom' },
  
  // Office
  { id: 'office-chair', name: 'Office Chair', image: officeChair, category: 'office' },
  { id: 'desk', name: 'Writing Desk', image: desk, category: 'office' },
  { id: 'bookshelf', name: 'Bookshelf', image: bookshelf, category: 'office' },
];

const categories = [
  { id: 'all', name: 'All', count: furnitureItems.length },
  { id: 'living', name: 'Living Room', count: furnitureItems.filter(item => item.category === 'living').length },
  { id: 'dining', name: 'Dining', count: furnitureItems.filter(item => item.category === 'dining').length },
  { id: 'bedroom', name: 'Bedroom', count: furnitureItems.filter(item => item.category === 'bedroom').length },
  { id: 'office', name: 'Office', count: furnitureItems.filter(item => item.category === 'office').length },
];

const FurnitureMenu = ({ open, onOpenChange, onAddFurniture }: FurnitureMenuProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);

  const filteredItems = furnitureItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddFurniture = (item: FurnitureItem) => {
    onAddFurniture?.(item);
    setSelectedItem(null);
  };

  const handleItemClick = (item: FurnitureItem) => {
    setSelectedItem(item);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Armchair className="w-6 h-6 text-primary" />
            Furniture Collection
          </DialogTitle>
          <DialogDescription>
            Browse and select furniture items to add to your room visualization
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 neu-input"
            />
          </div>

          {/* Categories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Furniture Grid */}
            <ScrollArea className="mt-4 h-[500px]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4 pb-12">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="warm-card p-4 cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                    onClick={() => handleItemClick(item)}
                  >
                     <div className="flex flex-col items-center gap-3">
                       <div className="w-16 h-16 rounded-xl bg-white/90 border border-border/50 overflow-hidden shadow-sm">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                       </div>
                      
                      <div className="text-center">
                        <h3 className="font-medium text-foreground text-sm transition-colors duration-300 hover:text-primary">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Armchair className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No furniture items found</p>
                  <p className="text-sm">Try adjusting your search or category filter</p>
                </div>
              )}
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>

      {/* Furniture Details Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
               <span className="flex items-center gap-2">
                 <Armchair className="w-5 h-5 text-primary" />
                 {selectedItem?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItem(null)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Furniture details and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
               <div className="flex flex-col items-center gap-4">
                 <div className="w-32 h-32 rounded-2xl bg-white/90 border border-border/50 overflow-hidden shadow-md">
                   <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                 </div>
                
                <div className="text-center">
                  <h3 className="font-semibold text-lg text-foreground">{selectedItem.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 capitalize">
                    {selectedItem.category.replace('living', 'Living Room')} Category
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAddFurniture(selectedItem)}
                  className="flex-1 coral-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Room
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default FurnitureMenu;

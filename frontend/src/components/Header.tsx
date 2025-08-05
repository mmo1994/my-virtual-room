import { useState } from "react";
import { Home, Menu, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import AuthDialog from "./auth/AuthDialog";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogTab, setAuthDialogTab] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginClick = () => {
    setAuthDialogTab('login');
    setAuthDialogOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthDialogTab('signup');
    setAuthDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.email) {
      return user.email.split('@')[0]; // Show email username part
    }
    return 'User';
  };

  return (
    <>
      <header className="w-full border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Home className="w-8 h-8 text-foreground" />
              <span className="text-2xl font-bold text-foreground">Spacify</span>
            </Link>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {isAuthenticated ? (
                // Authenticated user - show user name and dropdown
                <div className="flex items-center space-x-3">
                  <span className="text-foreground font-medium hidden sm:block">
                    {getUserDisplayName()}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm font-medium">
                        {getUserDisplayName()}
                      </div>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        {user?.email}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="w-full">
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                // Unauthenticated user - show login/signup buttons
                <>
                  <Button 
                    onClick={handleLoginClick}
                    variant="default"
                    size="sm"
                    className="md:size-default"
                  >
                    Log In
                  </Button>
                  <Button 
                    onClick={handleSignUpClick}
                    variant="coral"
                    size="sm"
                    className="md:size-default"
                  >
                    Sign Up
                  </Button>
                </>
              )}
              
              {/* Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Menu className="h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="flex flex-col space-y-6 mt-8">
                    <Link 
                      to="/" 
                      className="text-foreground hover:text-primary transition-colors text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Visualize
                    </Link>
                    <Link 
                      to="/how-it-works" 
                      className="text-foreground hover:text-primary transition-colors text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      How it works
                    </Link>
                    {isAuthenticated && (
                      <>
                        <hr className="border-border" />
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="text-foreground hover:text-primary transition-colors text-lg font-medium text-left"
                        >
                          Log Out
                        </button>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <AuthDialog 
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultTab={authDialogTab}
      />
    </>
  );
};

export default Header;
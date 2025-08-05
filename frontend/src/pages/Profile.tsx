import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, Palette, Settings, Save, Edit3, Key, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Profile = () => {
  const { user, updateProfile, changePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  // Redirect unauthenticated users to home page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Don't render anything while checking authentication or if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear message when user starts typing
    if (passwordMessage) setPasswordMessage(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        email: formData.email || undefined
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      // You might want to show an error message here
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordMessage({ type: 'error', text: 'New password must be different from current password' });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to change password. Please try again.' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || ""
    });
    setIsEditing(false);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  const formatJoinDate = () => {
    if (!user?.createdAt) return "Unknown";
    
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  const handleCreateFirstProject = () => {
    navigate('/');
  };

  // TODO: This should come from the backend when we implement project tracking
  const projectCount = 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Authenticated user profile page */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing ? (
                <div className="space-y-4 w-full max-w-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email address"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <CardTitle className="text-3xl font-bold">{getUserDisplayName()}</CardTitle>
                    <CardDescription className="text-lg mt-2">{user?.email}</CardDescription>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>Joined {formatJoinDate()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <span>{projectCount} generations</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    className="mt-4"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account preferences and settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-sm font-medium">Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Your email address verification status
                </p>
              </div>
              <Badge variant={user?.emailVerified ? "default" : "secondary"}>
                {user?.emailVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-sm font-medium">Password</Label>
                <p className="text-sm text-muted-foreground">
                  Change your account password
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-sm font-medium">Account Type</Label>
                <p className="text-sm text-muted-foreground">
                  Your current account tier
                </p>
              </div>
              <Badge variant="outline">Free</Badge>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <p className="text-sm text-muted-foreground">
                  When you joined Spacify
                </p>
              </div>
              <span className="text-sm font-medium">{formatJoinDate()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Section */}
        {showPasswordSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password. Make sure it's strong and secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordMessage && (
                <Alert variant={passwordMessage.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                  {passwordMessage.type === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{passwordMessage.text}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => togglePasswordVisibility('current')}
                      disabled={passwordLoading}
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? 'text' : 'password'}
                      placeholder="Enter your new password (min 8 characters)"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => togglePasswordVisibility('new')}
                      disabled={passwordLoading}
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-new-password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      disabled={passwordLoading}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => togglePasswordVisibility('confirm')}
                      disabled={passwordLoading}
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={passwordLoading}>
                    <Key className="w-4 h-4 mr-2" />
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      setPasswordMessage(null);
                    }}
                    disabled={passwordLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity - Placeholder for future implementation */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent room visualizations and projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by uploading a room photo to create your first visualization.
              </p>
              <Button onClick={handleCreateFirstProject}>Create Your First Project</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
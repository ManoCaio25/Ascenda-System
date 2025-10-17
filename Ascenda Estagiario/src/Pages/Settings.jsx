import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "@estagiario/Entities/all";
import { useI18n } from "@estagiario/Components/utils/i18n";
import { useAccessibility } from "@estagiario/Components/utils/accessibility";
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Bell, 
  Palette, 
  Globe,
  Accessibility,
  Eye,
  Sun,
  Moon,
  Contrast,
  Focus,
  Languages
} from "lucide-react";
import { Button } from "@estagiario/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@estagiario/Components/ui/card";
import { Switch } from "@estagiario/Components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@estagiario/Components/ui/select";
import { Input } from "@estagiario/Components/ui/input";
import { Label } from "@estagiario/Components/ui/label";
import AvatarWithFallback from "@estagiario/Components/ui/AvatarWithFallback";
import { avatarPlaceholders } from "@estagiario/Components/utils/avatarPlaceholders";

export default function SettingsPage() {
  const { t, language, changeLanguage } = useI18n();
  const { highContrast, focusMode, toggleHighContrast, toggleFocusMode } = useAccessibility();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ascenda-theme') || 'dark';
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    taskReminders: true,
    achievements: true
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      // Mock user for demo
      setUser({
        full_name: "Caio Menezes",
        email: "caio.alvarenga@ascenda.com",
        avatar_url: "",
        area_atuacao: "Frontend Development",
        pontos_gamificacao: 2847
      });
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('ascenda-theme', newTheme);
    document.documentElement.className = newTheme;
  };

  const handleAvatarSelect = (avatar) => {
    const avatarUrl = `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="url(#cosmic-gradient)"/>
        <text x="50" y="65" text-anchor="middle" font-size="40" fill="white">${avatar.emoji}</text>
        <defs>
          <linearGradient id="cosmic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B5CF6"/>
            <stop offset="100%" style="stop-color:#F97316"/>
          </linearGradient>
        </defs>
      </svg>`
    )}`;
    
    setUser(prev => ({ ...prev, avatar_url: avatarUrl }));
  };

  const tabs = [
    { id: 'profile', label: t('profile'), icon: UserIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'language', label: t('language'), icon: Languages },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <Card className="cosmic-card border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Profile Information</CardTitle>
          <CardDescription>Update your personal information and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <AvatarWithFallback user={user} size="xl" />
            <div>
              <h3 className="font-semibold text-white mb-2">Choose Avatar</h3>
              <div className="grid grid-cols-4 gap-2">
                {avatarPlaceholders.slice(0, 8).map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => handleAvatarSelect(avatar)}
                    className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors border border-purple-500/30 hover:border-purple-500"
                    title={avatar.description}
                  >
                    <span className="text-lg">{avatar.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Full Name</Label>
              <Input 
                value={user?.full_name || ""} 
                className="bg-slate-800 border-slate-600 text-white"
                readOnly
              />
            </div>
            <div>
              <Label className="text-white">Email</Label>
              <Input 
                value={user?.email || ""} 
                className="bg-slate-800 border-slate-600 text-white"
                readOnly
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Work Area</Label>
            <Input 
              value={user?.area_atuacao || ""} 
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <Card className="cosmic-card border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Theme Preferences</CardTitle>
          <CardDescription>Customize the visual appearance of your interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium">Color Theme</Label>
              <p className="text-sm text-slate-400">Choose between dark and light modes</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="w-4 h-4" />
                {t('darkMode')}
              </Button>
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('light')}
                className="flex items-center gap-2"
              >
                <Sun className="w-4 h-4" />
                {t('lightMode')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="space-y-6">
      <Card className="cosmic-card border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Accessibility Options</CardTitle>
          <CardDescription>Configure accessibility features for better usability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Contrast className="w-5 h-5 text-purple-400" />
              <div>
                <Label className="text-white font-medium">High Contrast Mode</Label>
                <p className="text-sm text-slate-400">Increases color contrast for better visibility</p>
              </div>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={toggleHighContrast}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Focus className="w-5 h-5 text-blue-400" />
              <div>
                <Label className="text-white font-medium">Focus Mode</Label>
                <p className="text-sm text-slate-400">Enhanced focus indicators for keyboard navigation</p>
              </div>
            </div>
            <Switch
              checked={focusMode}
              onCheckedChange={toggleFocusMode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLanguageTab = () => (
    <div className="space-y-6">
      <Card className="cosmic-card border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Language & Region</CardTitle>
          <CardDescription>Configure your preferred language and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-green-400" />
              <div>
                <Label className="text-white font-medium">Interface Language</Label>
                <p className="text-sm text-slate-400">Choose your preferred language for the interface</p>
              </div>
            </div>
            <Select value={language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card className="cosmic-card border-purple-700">
        <CardHeader>
          <CardTitle className="text-white">Notification Preferences</CardTitle>
          <CardDescription>Manage how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries({
            email: 'Email Notifications',
            push: 'Push Notifications', 
            taskReminders: 'Task Reminders',
            achievements: 'Achievement Notifications'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">{label}</Label>
                <p className="text-sm text-slate-400">
                  Receive {label.toLowerCase()} for important updates
                </p>
              </div>
              <Switch
                checked={notifications[key]}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  if (!user) {
    return (
      <div className="p-8 text-center">
        <div className="text-white">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('settings')}</h1>
        <p className="text-slate-400">Manage your account preferences and application settings</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 cosmic-card rounded-xl p-4 h-fit cosmic-glow">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-300 cosmic-glow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'accessibility' && renderAccessibilityTab()}
            {activeTab === 'language' && renderLanguageTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
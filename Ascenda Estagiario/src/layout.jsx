import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@estagiario/utils";
import {
  Home,
  BookOpen,
  CheckSquare,
  ListTodo,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  Trophy,
  ShoppingBag,
  Star,
  Zap,
  Sun,
  Moon,
  Languages
} from "lucide-react";
import { User } from "@estagiario/Entities/all";
import { Button } from "@estagiario/Components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@estagiario/Components/ui/sidebar";
import { useI18n } from "@estagiario/Components/utils/i18n";
import AIChatWidget from "@estagiario/Components/ai/AIChat";
import { UserContext } from "@estagiario/contexts/UserContext";

const navigationConfig = [
  { key: "dashboard", page: "Dashboard", icon: Home },
  { key: "learningPath", page: "LearningPath", icon: BookOpen },
  { key: "myTasks", page: "Tasks", icon: CheckSquare },
  { key: "activities", page: "Activities", icon: ListTodo },
  { key: "forum", page: "Forum", icon: MessageSquare },
  { key: "calendar", page: "Calendar", icon: Calendar },
];

// Helper component for Avatar with Fallback
const AvatarWithFallback = ({ user, size = "md" }) => {
  const avatarSizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  const currentSizeClass = avatarSizeClasses[size] || avatarSizeClasses.md;

  // Default avatar if user.avatar_url is null or empty
  const defaultAvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face";
  const imageUrl = user?.avatar_url || defaultAvatarUrl;

  const getInitials = (fullName) => {
    if (!fullName) return "U";
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className={`relative ${currentSizeClass} rounded-full border-2 border-purple-400 cosmic-glow flex items-center justify-center overflow-hidden`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={user?.full_name || "User Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white font-bold text-lg">{getInitials(user?.full_name)}</span>
      )}
    </div>
  );
};


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark'); // Can be 'dark', 'light', 'high-contrast'
  const [isFocusMode, setIsFocusMode] = useState(false); // New state for focus mode
  const { t, language, changeLanguage } = useI18n();

  const loadUser = useCallback(async () => {
    try {
      let currentUser = await User.me();
      currentUser = await ensureDefaultProfile(currentUser);
      setUser(currentUser);
    } catch (error) {
      // User not logged in, create a default user
      setUser({
        full_name: "Caio Menezes",
        email: "caio.alvarenga@ascenda.com",
        pontos_gamificacao: 2847,
        avatar_url: "", // Changed to empty string for fallback test
        area_atuacao: "Frontend Development",
        equipped_tag: "🚀 Cosmic Explorer"
      });
    }
  }, []);

  const navigationItems = useMemo(
    () =>
      navigationConfig.map((item) => ({
        title: t(item.key),
        url: createPageUrl(item.page),
        icon: item.icon,
      })),
    [language, t]
  );

  useEffect(() => {
    // Load initial theme and focus mode from local storage
    const savedTheme = localStorage.getItem('ascenda-theme') || 'dark';
    const savedFocusMode = localStorage.getItem('ascenda-focus-mode') === 'true'; // 'true' or 'false' string

    setTheme(savedTheme);
    setIsFocusMode(savedFocusMode);
  }, []); // Run once on component mount

  useEffect(() => {
    // Apply theme and focus mode classes to the document's root element
    let classList = [theme]; // Start with the current theme
    if (isFocusMode) {
      classList.push('focus-mode');
    }
    document.documentElement.className = classList.join(' '); // Set the combined class string
  }, [theme, isFocusMode]); // Re-run whenever theme or focusMode state changes

  const toggleTheme = () => {
    // This button only toggles between 'dark' and 'light'.
    // 'high-contrast' would be managed via a dedicated setting (e.g., on a Settings page).
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ascenda-theme', newTheme);
    // The useEffect above will handle updating document.documentElement.className
  };

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const unsubscribe = User.subscribe((change) => {
      if (!change) return;

      setUser((previous) => {
        if (change.type === 'remove') {
          if (!previous || (change.id && String(previous.id) !== String(change.id))) {
            return previous;
          }
          return null;
        }

        const updatedUser = change.record;
        if (!updatedUser) {
          return previous;
        }

        if (!previous || String(previous.id) === String(updatedUser.id)) {
          return updatedUser;
        }

        return previous;
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const userContextValue = useMemo(() => ({
    user,
    setUser,
    refreshUser: loadUser,
  }), [user, loadUser]);

  const handleLogout = useCallback(async () => {
    try {
      await User.logout();
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      try {
        sessionStorage.setItem("nextUrl", "/Login Ascenda/index.html");
        sessionStorage.removeItem("role");
      } catch (storageError) {
        console.warn("sessionStorage unavailable", storageError);
      }
      window.location.href = "/loading-page/index.html";
    }
  }, []);

  return (
    <UserContext.Provider value={userContextValue}>
      <div className="min-h-screen bg-background text-text-primary transition-colors duration-300">
      <style>{`
            :root.light {
              --background: #f1f5f9; /* slate-100 */
              --sidebar-bg: #ffffff;
              --card-bg: rgba(255, 255, 255, 0.7);
              --text-primary: #0f172a; /* slate-900 */
              --text-secondary: #64748b; /* slate-500 */
              --text-tertiary: #94a3b8; /* slate-400 */
              --border-color: #e2e8f0; /* slate-200 */
              --border-glow: rgba(139, 92, 246, 0.1);
              --hover-bg: #f1f5f9; /* slate-100 */
              --active-bg: #ede9fe; /* violet-100 */
              --active-text: #6d28d9; /* violet-700 */
              --primary-purple: #8B5CF6;
              --primary-orange: #F97316;
            }
            :root.dark {
              --background: #020617; /* slate-950 */
              --sidebar-bg: #0f172a; /* slate-900 */
              --card-bg: rgba(30, 41, 59, 0.5); /* slate-800 with opacity */
              --text-primary: #f8fafc; /* slate-50 */
              --text-secondary: #94a3b8; /* slate-400 */
              --text-tertiary: #475569; /* slate-600 */
              --border-color: #334155; /* slate-700 */
              --border-glow: rgba(139, 92, 246, 0.2);
              --hover-bg: rgba(139, 92, 246, 0.1); /* purple-500/10 */
              --active-bg: rgba(139, 92, 246, 0.2); /* purple-500/20 */
              --active-text: #c4b5fd; /* violet-300 */
              --primary-purple: #8B5CF6;
              --primary-orange: #F97316;
            }
            
            :root.high-contrast {
              --background: #000000;
              --sidebar-bg: #000000;
              --card-bg: #1a1a1a;
              --text-primary: #ffffff;
              --text-secondary: #ffffff;
              --text-tertiary: #cccccc;
              --border-color: #ffffff;
              --border-glow: rgba(255, 255, 255, 0.3);
              --hover-bg: #333333;
              --active-bg: #555555;
              --active-text: #ffff00;
              --primary-purple: #ff00ff;
              --primary-orange: #ffff00;
            }

            .bg-background { background-color: var(--background); }
            .text-text-primary { color: var(--text-primary); }
            .text-text-secondary { color: var(--text-secondary); }
            .sidebar-bg { background-color: var(--sidebar-bg); }
            .card-bg { background-color: var(--card-bg); }
            .border-default { border-color: var(--border-color); }
            
            .cosmic-gradient { background: linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-orange) 100%); }
            .cosmic-card {
              background-color: var(--card-bg);
              border: 1px solid var(--border-glow);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            .cosmic-glow { box-shadow: 0 0 20px rgba(139, 92, 246, 0.15), 0 0 40px rgba(139, 92, 246, 0.1); }
            
            .focus-mode *:focus {
              outline: 3px solid var(--primary-orange) !important;
              outline-offset: 2px !important;
            }
          `}</style>

      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar className="border-r border-default sidebar-bg">
            <SidebarHeader className="border-b border-default p-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 cosmic-gradient rounded-xl flex items-center justify-center cosmic-glow">
                        <span className="text-white font-bold text-xl">A</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                        Ascenda
                      </h2>
                      <p className="text-xs text-text-secondary">{t('companyMotto')}</p>
                    </div>
                  </div>
            </SidebarHeader>

            <SidebarContent className="p-4">
              {user && (
                <div className="cosmic-card rounded-xl p-4 mb-6 cosmic-glow">
                  <Link to={createPageUrl("Profile")} className="block">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <AvatarWithFallback user={user} size="md" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2" style={{ borderColor: 'var(--sidebar-bg)' }}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-text-primary text-sm truncate">
                            {user.full_name}
                          </p>
                          {user.equipped_tag && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full cosmic-gradient text-white truncate">{user.equipped_tag}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Zap className="w-3 h-3 text-orange-400" />
                          <span className="text-orange-400 font-bold">
                            {user.pontos_gamificacao || 2847}
                          </span>
                          <span className="text-text-secondary">{t('points')}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-purple-400 uppercase tracking-wider px-2 py-2">
                  {t('navigation')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          className={`text-text-secondary hover:text-text-primary transition-all duration-200 rounded-lg dark:hover:bg-purple-800/20 light:hover:bg-violet-100 ${
                            location.pathname === item.url ? 'dark:bg-purple-800/30 dark:text-purple-300 light:bg-violet-100 light:text-violet-700 cosmic-glow' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-xs font-medium text-purple-400 uppercase tracking-wider px-2 py-2">
                  {t('quickActions')}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-2 px-2">
                    <Link
                      to={createPageUrl("Profile?tab=badges")}
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-purple-400 transition-colors py-2"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>{t('myBadges')}</span>
                    </Link>
                    <Link
                      to={createPageUrl("Profile?tab=shop")}
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-orange-400 transition-colors py-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('avatarShop')}</span>
                    </Link>
                    <Link
                      to={createPageUrl("Tasks")}
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-purple-300 transition-colors py-2"
                    >
                      <Star className="w-4 h-4" />
                      <span>{t('myTasks')}</span>
                    </Link>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-default p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary flex items-center gap-2">
                    <Languages className="w-4 h-4" /> {t('language')}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      variant={language === 'pt' ? 'gradient' : 'ghost'}
                      size="sm"
                      onClick={() => changeLanguage('pt')}
                      className="flex items-center gap-2"
                      aria-label={t('languagePortuguese')}
                    >
                      <img
                        src="https://flagcdn.com/w20/br.png"
                        alt={t('languagePortuguese')}
                        className="w-5 h-4 rounded-sm object-cover"
                        loading="lazy"
                      />
                      <span>{t('languagePortugueseShort')}</span>
                    </Button>
                    <Button
                      variant={language === 'en' ? 'gradient' : 'ghost'}
                      size="sm"
                      onClick={() => changeLanguage('en')}
                      className="flex items-center gap-2"
                      aria-label={t('languageEnglish')}
                    >
                      <img
                        src="https://flagcdn.com/w20/us.png"
                        alt={t('languageEnglish')}
                        className="w-5 h-4 rounded-sm object-cover"
                        loading="lazy"
                      />
                      <span>{t('languageEnglishShort')}</span>
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={toggleTheme}
                  className="w-full justify-start text-text-secondary hover:text-text-primary dark:hover:bg-slate-800/50 light:hover:bg-slate-100"
                >
                  {theme === 'dark' || theme === 'high-contrast' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                  {theme === 'dark' ? t('lightMode') : t('darkMode')}
                </Button>
                <Link to={createPageUrl("Settings")}>
                  <Button className="w-full justify-start text-text-secondary hover:text-text-primary dark:hover:bg-slate-800/50 light:hover:bg-slate-100" variant="ghost">
                    <Settings className="w-4 h-4 mr-2" />
                    {t('settings')}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-text-secondary hover:text-text-primary dark:hover:bg-slate-800/50 light:hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="card-bg backdrop-blur-sm border-b border-default px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-hover-bg p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-xl font-semibold text-text-primary">Ascenda</h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
      <AIChatWidget />
      </div>
    </UserContext.Provider>
  );
}

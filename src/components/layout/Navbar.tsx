import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Trophy, User, Search, Calendar, Newspaper, LogOut, Settings } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/utilities/utils";
import { Skeleton } from "@/components/ui/skeleton"; 
import { supabase } from "@/utilities/supabase";
import { useAuth } from "@/hooks/AuthProvider";

interface SearchResult {
  id: number;
  type: "user" | "event";
  name: string;
  sport?: string;
  date?: string;
  role?: string;
}

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user, loading } = useAuth();

  const navLinks = [
    { href: "/", label: "Home", icon: Trophy },
    { href: "/search-athletes", label: "Athletes", icon: User },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/news", label: "News", icon: Newspaper },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // --- Search states (replicated) ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // simple filter + limit to 5
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

   async function fetchSearch() {
      try {
        const res = await fetch(`http://localhost:5000/api/search?q=${searchQuery}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Search fetch failed:", err);
        setSearchResults([]);
      }
    }


    fetchSearch();
  }, [searchQuery]);


  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tighter">ATHLETIX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link
                          to={link.href}
                          className={cn(
                            "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                            isActive(link.href) && "bg-accent text-accent-foreground"
                          )}
                          >
                          <link.icon className="mr-2 h-4 w-4" />
                          {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={searchRef}>
              <Button
                variant="ghost"
                className={cn("relative h-8 w-8 rounded-full p-0")}
                onClick={() => {
                  setIsSearchOpen((v) => !v);
                  if (!isSearchOpen) setTimeout(() => document.getElementById("navbar-search-input")?.focus(), 100);
                }}
              >
                <Search className="h-5 w-5 text-slate-600" />
              </Button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-2">
                    <input
                      id="navbar-search-input"
                      type="text"
                      className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Search athletes, events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  {searchQuery !== "" && (
                    <div className="border-t border-slate-100 py-1 max-h-60 overflow-auto">
                      {searchResults.length > 0 ? (
                        <>
                          <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase">Top Results</div>
                          {searchResults.map((result) => (
                            <button
                              key={`${result.type}-${result.id}`}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");

                                if (result.type === "event") {
                                  navigate(`/events/${result.id}`);
                                } else if (result.type === "user") {
                                  if (result.role === "athlete") {
                                    navigate(`/athletes/${result.id}`);
                                  } else {
                                    navigate(`/users/${result.id}`); // other roles
                                  }
                                }
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm flex items-center gap-2"
                            >
                              {result.type === "user" ? (
                                <User className="h-4 w-4 text-slate-600" />
                              ) : (
                                <Calendar className="h-4 w-4 text-slate-600" />
                              )}
                              <div className="flex flex-col">
                                <div className="font-medium">{result.name}</div>
                                {result.sport && <div className="text-xs text-slate-500">{result.sport}</div>}
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-slate-500">
                          No results found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-2" />

            {loading ? (
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8 border-2 border-black">
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      const role = localStorage.getItem("userRole"); 
                      const userId = localStorage.getItem("userId");
                      if (role === "athlete") {
                        navigate(`/athletes/${userId}`);
                      } else {
                        navigate(`/users/${userId}`);
                      }
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent",
                    isActive(link.href) && "bg-accent"
                  )}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2 border-t">
                {/* Mobile inline search */}
                <div className="px-4">
                  <input
                    type="text"
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Search athletes, events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="space-y-2 px-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ) : session ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                    <Button variant="secondary" className="w-full" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                      <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">Log In</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

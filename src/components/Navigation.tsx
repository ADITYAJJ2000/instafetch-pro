import { Video, Image, Film, Clock, Layers, Tv, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/", label: "Video", icon: Video },
  { path: "/photo", label: "Photo", icon: Image },
  { path: "/reels", label: "Reels", icon: Film },
  { path: "/story", label: "Story", icon: Clock },
  { path: "/carousel", label: "Carousel", icon: Layers },
  { path: "/igtv", label: "IGTV", icon: Tv },
  { path: "/viewer", label: "Viewer", icon: Eye },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex flex-wrap justify-center gap-2 p-2 bg-card/60 backdrop-blur-glass border border-border/50 rounded-2xl">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Button
              key={path}
              variant="ghost"
              onClick={() => navigate(path)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
                ${isActive 
                  ? "gradient-instagram text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

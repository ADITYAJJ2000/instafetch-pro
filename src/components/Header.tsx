import { Instagram } from "lucide-react";

export function Header() {
  return (
    <header className="text-center space-y-6 mb-12">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="relative group">
          <div className="absolute -inset-4 gradient-instagram rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="relative w-20 h-20 gradient-instagram rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
            <Instagram className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
      </div>
      
      {/* Title */}
      <div className="space-y-3">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="gradient-text">Xinstan</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light">
          Download Instagram Videos & Photos
        </p>
      </div>
      
      {/* Subtitle */}
      <p className="text-muted-foreground max-w-md mx-auto">
        Paste any Instagram link to download videos, photos, reels, stories, and IGTV content instantly.
      </p>
    </header>
  );
}

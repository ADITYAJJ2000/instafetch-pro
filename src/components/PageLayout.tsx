import { ReactNode } from "react";
import { BackgroundGradient } from "@/components/BackgroundGradient";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <BackgroundGradient />
      
      <main className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <Header />
        <Navigation />
        {children}
        
        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>Xinstan is not affiliated with Instagram or Meta.</p>
          <p className="mt-1">Use responsibly and respect copyright.</p>
        </footer>
      </main>
    </div>
  );
}

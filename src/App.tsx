import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import VideoPage from "./pages/VideoPage";
import PhotoPage from "./pages/PhotoPage";
import ReelsPage from "./pages/ReelsPage";
import StoryPage from "./pages/StoryPage";
import CarouselPage from "./pages/CarouselPage";
import IGTVPage from "./pages/IGTVPage";
import ViewerPage from "./pages/ViewerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<VideoPage />} />
          <Route path="/photo" element={<PhotoPage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/carousel" element={<CarouselPage />} />
          <Route path="/igtv" element={<IGTVPage />} />
          <Route path="/viewer" element={<ViewerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

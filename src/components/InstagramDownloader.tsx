import { useState } from "react";
import { Download, Instagram, Loader2, Play, Image as ImageIcon, Link, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaResult {
  url: string;
  type: string;
  thumbnail?: string;
}

interface ApiResponse {
  status?: string;
  result?: MediaResult[];
  error?: string;
}

export function InstagramDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MediaResult[]>([]);

  const handleDownload = async () => {
    if (!url.trim()) {
      toast.error("Please enter an Instagram URL");
      return;
    }

    if (!url.includes("instagram.com")) {
      toast.error("Please enter a valid Instagram URL");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke<ApiResponse>("instagram-download", {
        body: { url: url.trim() },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.result && Array.isArray(data.result)) {
        setResults(data.result);
        toast.success("Media found! Click to download.");
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No media found in the response");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch media";
      toast.error(errorMessage);
      console.error("Download error:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (mediaUrl: string, index: number) => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `instagram_media_${index + 1}.${blob.type.includes("video") ? "mp4" : "jpg"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("Download started!");
    } catch (err) {
      toast.error("Failed to download file");
      console.error("Download error:", err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="relative group">
        <div className="absolute -inset-1 gradient-instagram rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        <div className="relative bg-card/80 backdrop-blur-glass border border-border/50 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-instagram flex items-center justify-center">
              <Link className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Paste Instagram Link</h2>
              <p className="text-sm text-muted-foreground">Posts, Reels, Stories, IGTV</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://www.instagram.com/p/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDownload()}
              className="flex-1 h-12 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 rounded-xl"
            />
            <Button
              onClick={handleDownload}
              disabled={loading}
              className="h-12 px-6 gradient-instagram hover:opacity-90 transition-opacity rounded-xl font-semibold"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Found {results.length} media file{results.length > 1 ? "s" : ""}</h3>
          </div>
          
          <div className="grid gap-4">
            {results.map((media, index) => (
              <div
                key={index}
                className="group relative bg-card/60 backdrop-blur-glass border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {media.thumbnail ? (
                      <img
                        src={media.thumbnail}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {media.type === "video" ? (
                          <Play className="w-8 h-8 text-muted-foreground" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    {media.type === "video" && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground capitalize">
                      {media.type || "Media"} #{index + 1}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {media.url.substring(0, 50)}...
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => downloadFile(media.url, index)}
                    className="gradient-instagram hover:opacity-90 transition-opacity rounded-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

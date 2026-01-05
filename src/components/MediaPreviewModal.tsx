import { X, Download, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: {
    url: string;
    type: string;
    thumbnail?: string;
  };
  index: number;
}

const isVideoType = (type: string) => {
  return type === "video" || type === "mp4" || type === "webm" || type === "mov";
};

export function MediaPreviewModal({ 
  isOpen, 
  onClose, 
  media,
  index
}: MediaPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const isVideo = isVideoType(media.type);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    
    try {
      // Use proxy to avoid CORS and get correct file type
      const { data, error } = await supabase.functions.invoke("instagram-proxy", {
        body: { mediaUrl: media.url },
      });

      if (error) throw new Error(error.message);

      // Get the original content type from headers
      const originalType = data?.headers?.get?.("X-Original-Content-Type") || 
                          (isVideo ? "video/mp4" : "image/jpeg");
      
      const ext = isVideo ? "mp4" : "jpg";
      const mimeType = isVideo ? "video/mp4" : "image/jpeg";
      
      const blob = new Blob([data], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `instagram_${isVideo ? "video" : "image"}_${index + 1}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("Download complete!");
    } catch (err) {
      console.error("Download error:", err);
      toast.info("Opening in new tab...");
      window.open(media.url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  }, [media, index, isVideo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-lg"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Media Preview
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="relative bg-background/50 flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}
          
          {isVideo ? (
            <video
              src={media.url}
              controls
              autoPlay
              playsInline
              crossOrigin="anonymous"
              className="max-w-full max-h-[60vh] object-contain"
              onLoadedData={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <img
              src={media.url}
              alt="Instagram media"
              crossOrigin="anonymous"
              className="max-w-full max-h-[60vh] object-contain"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="gradient-instagram hover:opacity-90 rounded-xl"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

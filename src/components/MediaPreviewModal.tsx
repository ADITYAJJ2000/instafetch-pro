import { X, Download, Play, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useEffect, useRef } from "react";
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
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isVideo = isVideoType(media.type);

  // Load media through proxy with optimized fetching
  const loadMediaViaProxy = useCallback(async () => {
    setIsLoading(true);
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      const { data, error } = await supabase.functions.invoke("instagram-proxy", {
        body: { mediaUrl: media.url },
      });
      
      if (error) throw new Error(error.message);
      if (!data) throw new Error("No data received");
      
      const mimeType = isVideo ? "video/mp4" : "image/jpeg";
      
      // Handle different response types efficiently
      let blob: Blob;
      if (data instanceof Blob) {
        blob = new Blob([data], { type: mimeType });
      } else if (data instanceof ArrayBuffer) {
        blob = new Blob([data], { type: mimeType });
      } else if (typeof data === "object" && data !== null) {
        const values = Object.values(data) as number[];
        const uint8 = new Uint8Array(values);
        blob = new Blob([uint8], { type: mimeType });
      } else {
        throw new Error("Unexpected data format");
      }
      
      const url = URL.createObjectURL(blob);
      setMediaBlobUrl(url);
    } catch (err) {
      console.error("Failed to load media via proxy:", err);
      // Fallback to direct URL
      setMediaBlobUrl(media.url);
    } finally {
      setIsLoading(false);
    }
  }, [media.url, isVideo]);

  // Load media when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMediaViaProxy();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (mediaBlobUrl) {
        URL.revokeObjectURL(mediaBlobUrl);
        setMediaBlobUrl(null);
      }
    };
  }, [isOpen, media.url]);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    
    try {
      const ext = isVideo ? "mp4" : "jpg";
      
      // If we already have the blob URL, use it directly for faster download
      if (mediaBlobUrl) {
        const link = document.createElement("a");
        link.href = mediaBlobUrl;
        link.download = `instagram_${isVideo ? "video" : "image"}_${index + 1}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download complete!");
        return;
      }
      
      // Fallback: fetch via proxy if blob not available
      const mimeType = isVideo ? "video/mp4" : "image/jpeg";
      const { data, error } = await supabase.functions.invoke("instagram-proxy", {
        body: { mediaUrl: media.url },
      });

      if (error) throw new Error(error.message);
      
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
  }, [media, index, isVideo, mediaBlobUrl]);

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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 gap-6 p-8">
              {/* Animated loader with pulsing rings */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 animate-ping absolute inset-0" />
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center relative">
                  {isVideo ? (
                    <Play className="w-10 h-10 text-primary animate-pulse" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-primary animate-pulse" />
                  )}
                </div>
              </div>
              
              {/* Smooth animated dots */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Loading {isVideo ? "video" : "image"}</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
          
          {mediaBlobUrl && isVideo && (
            <video
              src={mediaBlobUrl}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-[60vh] object-contain"
            >
              Your browser does not support video playback.
            </video>
          )}
          
          {mediaBlobUrl && !isVideo && (
            <img
              src={mediaBlobUrl}
              alt="Instagram media"
              className="max-w-full max-h-[60vh] object-contain"
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

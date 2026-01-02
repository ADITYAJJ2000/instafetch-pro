import { X, Download, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { forwardRef, useState } from "react";

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: {
    url: string;
    type: string;
    thumbnail?: string;
  };
  onDownload: () => void;
  isDownloading: boolean;
}

export const MediaPreviewModal = forwardRef<HTMLDivElement, MediaPreviewModalProps>(
  function MediaPreviewModal({ isOpen, onClose, media, onDownload, isDownloading }, ref) {
    const [isLoading, setIsLoading] = useState(true);

    if (!isOpen) return null;

    return (
      <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            
            {media.type === "video" ? (
              <video
                src={media.url}
                controls
                autoPlay
                playsInline
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
              onClick={onDownload}
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
);

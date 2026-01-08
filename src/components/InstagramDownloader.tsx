import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { Download, Loader2, Play, Image as ImageIcon, Link, Sparkles, Eye, PackageCheck, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const MediaPreviewModal = lazy(() => import("./MediaPreviewModal").then(m => ({
  default: m.MediaPreviewModal
})));
interface MediaResult {
  url: string;
  type: string;
  thumbnail?: string;
  quality?: string;
}
interface ApiResponse {
  status?: string;
  result?: MediaResult[];
  media?: MediaResult[];
  error?: string;
}
export function InstagramDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MediaResult[]>([]);
  const [previewMedia, setPreviewMedia] = useState<MediaResult | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkCurrent, setBulkCurrent] = useState(0);

  // Clipboard paste handler
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.includes("instagram.com")) {
        setUrl(text.trim());
        toast.success("Link pasted from clipboard!");
      } else if (text) {
        setUrl(text.trim());
        toast.info("Pasted content - please ensure it's an Instagram link");
      } else {
        toast.error("Clipboard is empty");
      }
    } catch (err) {
      toast.error("Unable to access clipboard. Please paste manually.");
    }
  }, []);

  // Auto-paste on focus if clipboard has Instagram URL
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text");
      if (text && text.includes("instagram.com")) {
        setUrl(text.trim());
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);
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
      const {
        data,
        error
      } = await supabase.functions.invoke<ApiResponse>("instagram-download", {
        body: {
          url: url.trim()
        }
      });

      // When the backend returns non-2xx, Supabase returns an error object here.
      if (error) {
        const ctxBody = (error as any)?.context?.body;
        const combined = `${error.message ?? ""}\n${typeof ctxBody === "string" ? ctxBody : ""}`.toLowerCase();
        if (combined.includes("monthly quota") || combined.includes("quota")) {
          toast.error("Download service temporarily unavailable.", {
            description: "The provider quota is exceeded. Try again later.",
            duration: 6000
          });
        } else if (combined.includes("429") || combined.includes("rate limit")) {
          toast.error("Too many requests. Please wait and try again.");
        } else {
          toast.error("Failed to fetch media. Please try again.");
        }
        return;
      }
      const code = (data as any)?.code as string | undefined;
      if (code === "QUOTA_EXCEEDED") {
        toast.error("Download service temporarily unavailable.", {
          description: "The provider quota is exceeded. Try again later.",
          duration: 6000
        });
        return;
      }
      if (data?.media && Array.isArray(data.media)) {
        setResults(data.media);
        toast.success("Media found! Click to preview or download.");
      } else if (data?.result && Array.isArray(data.result)) {
        setResults(data.result);
        toast.success("Media found! Click to preview or download.");
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.error("No media found in the response");
      }
    } catch (err: unknown) {
      console.error("Download error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const isVideoType = (type: string) => {
    return type === "video" || type === "mp4" || type === "webm" || type === "mov";
  };
  const handleBulkDownload = useCallback(async () => {
    if (results.length === 0) return;
    setBulkDownloading(true);
    setBulkProgress(0);
    setBulkCurrent(0);
    let successCount = 0;
    for (let i = 0; i < results.length; i++) {
      const media = results[i];
      setBulkCurrent(i + 1);
      setBulkProgress((i + 1) / results.length * 100);
      try {
        const isVideo = isVideoType(media.type);
        const ext = isVideo ? "mp4" : "jpg";
        const mimeType = isVideo ? "video/mp4" : "image/jpeg";
        const {
          data,
          error
        } = await supabase.functions.invoke("instagram-proxy", {
          body: {
            mediaUrl: media.url
          }
        });
        if (error) throw new Error(error.message);
        const blob = new Blob([data], {
          type: mimeType
        });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `instagram_${isVideo ? "video" : "image"}_${i + 1}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        successCount++;

        // Small delay between downloads to prevent browser issues
        if (i < results.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.error(`Failed to download item ${i + 1}:`, err);
      }
    }
    setBulkDownloading(false);
    setBulkProgress(0);
    setBulkCurrent(0);
    if (successCount === results.length) {
      toast.success(`All ${successCount} files downloaded!`);
    } else if (successCount > 0) {
      toast.success(`Downloaded ${successCount} of ${results.length} files`);
    } else {
      toast.error("Failed to download files");
    }
  }, [results]);
  return <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="relative group">
        <div className="absolute -inset-1 gradient-instagram rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        <div className="relative bg-card/80 backdrop-blur-glass border border-border/50 p-6 space-y-4 rounded-3xl shadow-none px-[12px] py-[20px]">
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
            <div className="relative flex-1">
              <Input type="url" placeholder="https://www.instagram.com/p/..." value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && handleDownload()} className="h-12 pr-12 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 rounded-xl" />
              <Button type="button" variant="ghost" size="icon" onClick={handlePasteFromClipboard} className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-primary/10 rounded-lg" title="Paste from clipboard">
                <Clipboard className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
            <Button onClick={handleDownload} disabled={loading} className="h-12 px-6 gradient-instagram hover:opacity-90 transition-opacity rounded-xl font-semibold">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </>}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && <div className="space-y-4 mx-0 my-[100px] px-0 py-[100px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Found {results.length} media file{results.length > 1 ? "s" : ""}</h3>
            </div>
            
            {results.length > 1 && <Button onClick={handleBulkDownload} disabled={bulkDownloading} className="gradient-instagram hover:opacity-90 transition-opacity rounded-xl">
                {bulkDownloading ? <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {bulkCurrent}/{results.length}
                  </> : <>
                    <PackageCheck className="w-4 h-4 mr-2" />
                    Download All
                  </>}
              </Button>}
          </div>
          
          {/* Bulk Download Progress */}
          {bulkDownloading && <div className="bg-card/60 backdrop-blur-glass border border-border/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Downloading {bulkCurrent} of {results.length}...</span>
                <span className="text-primary font-medium">{Math.round(bulkProgress)}%</span>
              </div>
              <Progress value={bulkProgress} className="h-2" />
            </div>}
          
          <div className="grid gap-4">
            {results.map((media, index) => <div key={index} className="group relative bg-card/60 backdrop-blur-glass border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300">
                <div className="p-4 gap-[16px] flex items-center justify-center py-[40px] px-[20px]">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => {
              setPreviewMedia(media);
              setPreviewIndex(index);
            }}>
                    {media.thumbnail ? <img src={media.thumbnail} alt={`Media ${index + 1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                        {media.type === "video" ? <Play className="w-8 h-8 text-muted-foreground" /> : <ImageIcon className="w-8 h-8 text-muted-foreground" />}
                      </div>}
                    {(media.type === "video" || media.type === "mp4") && <div className="absolute inset-0 bg-background/50 flex items-center justify-center px-0">
                        <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
                          <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
                        </div>
                      </div>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {media.quality}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => {
                setPreviewMedia(media);
                setPreviewIndex(index);
              }} className="rounded-lg hover:border-primary hover:text-primary">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => {
                setPreviewMedia(media);
                setPreviewIndex(index);
              }} className="gradient-instagram hover:opacity-90 transition-opacity rounded-lg">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>)}
          </div>
        </div>}

      {/* Preview Modal */}
      {previewMedia && <Suspense fallback={<div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
          <MediaPreviewModal isOpen={!!previewMedia} onClose={() => setPreviewMedia(null)} media={previewMedia} index={previewIndex} />
        </Suspense>}
    </div>;
}
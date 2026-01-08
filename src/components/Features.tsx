import { Zap, Shield, Download, Smartphone } from "lucide-react";
const features = [{
  icon: Zap,
  title: "Lightning Fast",
  description: "Download in seconds with our optimized servers"
}, {
  icon: Shield,
  title: "100% Safe",
  description: "No login required, completely anonymous"
}, {
  icon: Download,
  title: "HD Quality",
  description: "Download in the highest available quality"
}, {
  icon: Smartphone,
  title: "All Formats",
  description: "Posts, Reels, Stories, IGTV supported"
}];
export function Features() {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto my-[50px] border border-solid rounded-lg">
      {features.map((feature, index) => <div key={index} className="group relative bg-card/40 backdrop-blur-glass border border-border/30 rounded-xl p-4 text-center hover:border-primary/30 transition-all duration-300">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          </div>
          <h3 className="font-medium text-foreground text-sm mb-1">{feature.title}</h3>
          <p className="text-xs text-muted-foreground">{feature.description}</p>
        </div>)}
    </div>;
}
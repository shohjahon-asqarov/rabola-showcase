import { Link } from "react-router-dom";
import { Github, Twitter, Send, Instagram } from "lucide-react";
import mascotAsset from "@/assets/rabola-mascot.png.asset.json";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-card/40">
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 font-bold text-lg">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden ring-1 ring-primary/15 bg-gradient-to-br from-primary/10 to-[hsl(var(--primary-glow))]/10">
                <img src={mascotAsset.url} alt="RABOLA" className="h-10 w-10 object-contain" />
              </span>
              <span className="text-primary">RABOLA</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">
              Dasturchilar uchun aqlli platforma — o'z loyihalaringizni namoyish qiling, ilhomlaning va rivojlaning.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {[
                { Icon: Github, label: "GitHub sahifamiz", href: "https://github.com" },
                { Icon: Twitter, label: "Twitter sahifamiz", href: "https://twitter.com" },
                { Icon: Send, label: "Telegram kanalimiz", href: "https://t.me" },
                { Icon: Instagram, label: "Instagram sahifamiz", href: "https://instagram.com" }
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Platforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/feed" className="hover:text-foreground transition-colors">Bosh sahifa</Link></li>
              <li><Link to="/feed?tab=top" className="hover:text-foreground transition-colors">Top reyting</Link></li>
              <li><Link to="/groups" className="hover:text-foreground transition-colors">Guruhlar</Link></li>
              <li><Link to="/add-post" className="hover:text-foreground transition-colors">Sayt joylash</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Yordam</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Qoidalar</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Maxfiylik</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Aloqa</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2026 RABOLA. Barcha huquqlar himoyalangan.</span>
          <span>Made with <span className="text-destructive">♥</span> in Uzbekistan</span>
        </div>
      </div>
    </footer>
  );
}
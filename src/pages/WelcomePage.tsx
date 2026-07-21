import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Upload, Trophy, ArrowRight, Check } from "lucide-react";

const slides = [
  {
    icon: Sparkles,
    title: "RABOLA'ga xush kelibsiz! 🎉",
    subtitle: "Dasturchilar hamjamiyati",
    body: "RABOLA — bu o'z web-loyihalaringizni butun dunyoga namoyish etadigan zamonaviy platforma. Boshqa dasturchilarning ishlarini kashf eting, ilhomlaning va o'zingizni ko'rsating.",
    features: [
      "Loyihalaringizni portfoliongizga qo'shing",
      "Real vaqtli layk va sharhlar",
      "Guruhlarga qo'shilib jamoada ishlang",
    ],
  },
  {
    icon: Upload,
    title: "Loyihangizni qanday joylashtirish?",
    subtitle: "3 ta oddiy qadam",
    body: "Sayt joylash juda oson: rasm, nom va tavsif kiriting — tayyor! Adminlar tekshiruvidan o'tgach loyihangiz asosiy sahifada namoyon bo'ladi.",
    features: [
      '"Sayt joylash" tugmasini bosing',
      "1-5 ta rasm, nom va tavsif qo'shing",
      "Moderatsiyadan so'ng chop etiladi",
    ],
  },
  {
    icon: Trophy,
    title: "Top reytingga chiqing 🏆",
    subtitle: "Faol bo'ling — yuqoriga ko'tariling",
    body: "Loyihalaringiz qancha ko'p layk yig'sa, reytingda shuncha yuqoriga chiqasiz. Top-3 g'oliblari bosh sahifada alohida ajratib ko'rsatiladi.",
    features: [
      "Har bir layk sizni yuqoriga olib chiqadi",
      "Faol foydalanuvchilar Top reytingda",
      "Ustozlar va tengdoshlaringizdan o'rganing",
    ],
  },
];

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && localStorage.getItem(`webverse_onboarded_${user.id}`) === "1") {
      navigate("/feed", { replace: true });
    }
  }, [user, loading, navigate]);

  const finish = () => {
    if (user) localStorage.setItem(`webverse_onboarded_${user.id}`, "1");
    navigate("/feed", { replace: true });
  };

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else finish();
  };

  const slide = slides[step];
  const Icon = slide.icon;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl surface-card p-6 sm:p-10 space-y-6">
        {/* progress */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="text-center space-y-4 opacity-0 animate-fade-up" key={step} style={{ animationFillMode: "forwards" }}>
          <div
            className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Icon className="h-9 w-9" strokeWidth={2.2} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{slide.subtitle}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{slide.title}</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">{slide.body}</p>

          <ul className="text-left space-y-2 max-w-md mx-auto pt-4">
            {slide.features.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={finish}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            O'tkazib yuborish
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{step + 1} / {slides.length}</span>
            <button
              onClick={next}
              className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
              style={{ background: "var(--gradient-primary)" }}
            >
              {step < slides.length - 1 ? "Keyingisi" : "Boshlash"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-6 card-shadow">
              <Sparkles className="h-4 w-4 text-accent" />
              Inteligência Artificial para equipes jurídicas
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Gerencie tarefas jurídicas com{" "}
              <span className="text-gradient">IA inteligente</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              O único assistente de tarefas que fala jurídico e pensa como um coordenador de escritório. 
              Categorização automática, alertas de prazos e produtividade em tempo real.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/cadastro">
                <Button size="lg" className="bg-hero-gradient text-primary-foreground hover:opacity-90 transition-opacity gap-2">
                  Começar Gratuitamente <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button size="lg" variant="outline" className="transition-all hover:card-shadow">
                  Ver como funciona
                </Button>
              </a>
            </div>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-2xl overflow-hidden card-shadow">
              <img
                src={heroImg}
                alt="TaskFlow IA - Plataforma de gerenciamento de tarefas jurídicas"
                width={1280}
                height={720}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "149",
    description: "Ideal para escritórios pequenos",
    users: "Até 5 usuários",
    features: [
      "Categorização por IA",
      "Painel Kanban",
      "Alertas de prazo",
      "Comentários nas tarefas",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Team",
    price: "349",
    description: "Para equipes em crescimento",
    users: "Até 20 usuários",
    features: [
      "Tudo do Starter",
      "Relatórios de produtividade",
      "IA com sugestões avançadas",
      "Integrações premium",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: null,
    description: "Soluções sob medida",
    users: "Usuários ilimitados",
    features: [
      "Tudo do Team",
      "SSO e segurança avançada",
      "API dedicada",
      "Gerente de conta",
      "SLA personalizado",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="planos" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos e Preços</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua equipe.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "border-primary bg-card card-shadow-hover scale-[1.02]"
                  : "border-border bg-card card-shadow hover:card-shadow-hover"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-hero-gradient px-4 py-1 text-xs font-medium text-primary-foreground">
                  Mais Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-1">
                {plan.price ? (
                  <span className="text-4xl font-extrabold">
                    R${plan.price}
                    <span className="text-base font-normal text-muted-foreground">/mês</span>
                  </span>
                ) : (
                  <span className="text-2xl font-bold">Sob consulta</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.users}</p>
              <Link to="/cadastro">
                <Button
                  className={`w-full mb-6 transition-opacity hover:opacity-90 ${
                    plan.popular ? "bg-hero-gradient text-primary-foreground" : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.price ? "Começar agora" : "Falar com vendas"}
                </Button>
              </Link>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

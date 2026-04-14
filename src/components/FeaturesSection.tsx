import { Brain, Clock, MessageSquare, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Categorização por IA",
    description: "Descreva a tarefa em linguagem natural e a IA categoriza automaticamente tipo, urgência e área do direito.",
  },
  {
    icon: Clock,
    title: "Alertas Inteligentes",
    description: "Receba notificações antes do vencimento dos prazos, com priorização automática baseada no tipo de demanda.",
  },
  {
    icon: MessageSquare,
    title: "Comentários e Colaboração",
    description: "Equipe pode deixar sugestões, melhorias e acompanhar o histórico completo de cada tarefa.",
  },
  {
    icon: BarChart3,
    title: "Relatórios de Produtividade",
    description: "Relatórios semanais automáticos com gráficos de status, tempo médio e índice de cumprimento.",
  },
  {
    icon: Shield,
    title: "Painel Kanban Visual",
    description: "Quadro visual com colunas de status e indicadores de urgência por cores para visibilidade total.",
  },
  {
    icon: Zap,
    title: "Próximos Passos Automáticos",
    description: "A IA sugere próximos passos para cada tarefa criada, acelerando a execução da equipe.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que sua equipe jurídica precisa
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ferramentas inteligentes projetadas para o fluxo de trabalho jurídico brasileiro.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-hero-gradient p-2.5">
                <feature.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

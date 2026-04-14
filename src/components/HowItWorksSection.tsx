const steps = [
  {
    number: "01",
    title: "Descreva a tarefa",
    description: "Escreva em linguagem natural o que precisa ser feito. Sem formulários complicados.",
  },
  {
    number: "02",
    title: "IA categoriza e prioriza",
    description: "A inteligência artificial classifica tipo, urgência, área do direito e define prazos.",
  },
  {
    number: "03",
    title: "Acompanhe e colabore",
    description: "Monitore o progresso no Kanban, receba alertas e deixe comentários na tarefa.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Em três passos simples, sua equipe ganha produtividade e nunca mais perde um prazo.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center group">
              <div className="text-6xl font-extrabold text-gradient opacity-20 mb-4 transition-opacity duration-300 group-hover:opacity-40">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-12 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

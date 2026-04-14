import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, BarChart3 } from "lucide-react";

const AnimatedCounter = ({ target, duration = 2000, suffix = "" }: { target: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}{suffix}</span>;
};

const tasks = [
  { name: "Petição inicial - Caso Silva", status: "done", priority: "alta", time: "2h" },
  { name: "Recurso trabalhista #4521", status: "progress", priority: "urgente", time: "4h" },
  { name: "Parecer contratual - ABC Corp", status: "done", priority: "média", time: "1h" },
  { name: "Audiência preparatória", status: "progress", priority: "alta", time: "3h" },
  { name: "Revisão de contrato social", status: "todo", priority: "média", time: "5h" },
];

const barData = [
  { label: "Seg", before: 35, after: 85 },
  { label: "Ter", before: 40, after: 90 },
  { label: "Qua", before: 30, after: 78 },
  { label: "Qui", before: 45, after: 92 },
  { label: "Sex", before: 38, after: 88 },
];

const priorityColors: Record<string, string> = {
  urgente: "bg-destructive/15 text-destructive",
  alta: "bg-amber-100 text-amber-700",
  média: "bg-primary/10 text-primary",
};

const statusIcons: Record<string, React.ReactNode> = {
  done: <CheckCircle2 className="h-4 w-4 text-accent" />,
  progress: <Clock className="h-4 w-4 text-amber-500" />,
  todo: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
};

const DashboardPreview = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    const el = document.getElementById("dashboard-preview");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="dashboard-preview"
      className={`rounded-2xl border border-border bg-card p-5 card-shadow transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: TrendingUp, label: "Produtividade", value: 94, suffix: "%", color: "text-accent" },
          { icon: Users, label: "Prazos cumpridos", value: 98, suffix: "%", color: "text-primary" },
          { icon: BarChart3, label: "Tarefas/dia", value: 12, suffix: "", color: "text-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-background p-3 transition-all duration-300 hover:card-shadow-hover hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">
              {visible ? <AnimatedCounter target={stat.value} suffix={stat.suffix} /> : "0" + stat.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Tasks */}
      <div className="grid grid-cols-5 gap-4">
        {/* Mini chart */}
        <div className="col-span-2 rounded-xl border border-border bg-background p-3">
          <p className="text-xs font-medium mb-3 text-muted-foreground">Antes vs Depois do TaskFlow</p>
          <div className="flex items-end gap-1.5 h-28">
            {barData.map((d, i) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end h-24">
                  <div
                    className="flex-1 rounded-t bg-muted-foreground/20 transition-all duration-700"
                    style={{
                      height: visible ? `${d.before}%` : "0%",
                      transitionDelay: `${i * 100}ms`,
                    }}
                  />
                  <div
                    className="flex-1 rounded-t bg-hero-gradient transition-all duration-700"
                    style={{
                      height: visible ? `${d.after}%` : "0%",
                      transitionDelay: `${i * 100 + 50}ms`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2 justify-center">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-2 rounded-sm bg-muted-foreground/20" /> Antes
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-2 rounded-sm bg-hero-gradient" /> Depois
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="col-span-3 rounded-xl border border-border bg-background p-3">
          <p className="text-xs font-medium mb-2 text-muted-foreground">Tarefas em andamento</p>
          <div className="space-y-1.5">
            {tasks.map((task, i) => (
              <div
                key={task.name}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all duration-300 hover:bg-muted/60"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(12px)",
                  transitionDelay: `${i * 80 + 400}ms`,
                }}
              >
                {statusIcons[task.status]}
                <span className="flex-1 truncate font-medium">{task.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="text-muted-foreground">{task.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;

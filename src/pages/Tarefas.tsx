import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import Logo from "@/components/Logo";
import {
  LogOut, Plus, MessageSquare, Send, Loader2, Sparkles,
  Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Trash2, LayoutGrid, List, BarChart3, AlertTriangle,
  CalendarClock, TrendingUp, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  ai_suggestion: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
};

type Comment = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  author_name: string | null;
  created_at: string;
};

const priorityConfig: Record<string, { label: string; color: string; kanbanBorder: string }> = {
  baixa: { label: "Baixa", color: "bg-emerald-100 text-emerald-700 border-emerald-200", kanbanBorder: "border-l-emerald-400" },
  media: { label: "Média", color: "bg-amber-100 text-amber-700 border-amber-200", kanbanBorder: "border-l-amber-400" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-200", kanbanBorder: "border-l-orange-400" },
  urgente: { label: "Urgente", color: "bg-red-100 text-red-700 border-red-200", kanbanBorder: "border-l-red-500" },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pendente: { label: "Pendente", icon: <Clock className="h-3.5 w-3.5" />, color: "bg-muted text-muted-foreground" },
  em_andamento: { label: "Em Andamento", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, color: "bg-primary/10 text-primary" },
  concluida: { label: "Concluída", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "bg-emerald-100 text-emerald-700" },
  cancelada: { label: "Cancelada", icon: <XCircle className="h-3.5 w-3.5" />, color: "bg-destructive/10 text-destructive" },
};

const kanbanColumns = ["pendente", "em_andamento", "concluida", "cancelada"];

function getDueDateAlert(dueDate: string | null): { label: string; className: string } | null {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return { label: "Atrasada", className: "bg-red-100 text-red-700 animate-pulse" };
  if (diffDays <= 1) return { label: "Vence hoje", className: "bg-red-100 text-red-700" };
  if (diffDays <= 3) return { label: `Vence em ${Math.ceil(diffDays)}d`, className: "bg-amber-100 text-amber-700" };
  return { label: `${Math.ceil(diffDays)}d restantes`, className: "bg-emerald-50 text-emerald-600" };
}

const Tarefas = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "reports">("kanban");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setTasks(data as Task[]);
  };

  const fetchComments = async (taskId: string) => {
    const { data, error } = await supabase
      .from("task_comments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setComments((prev) => ({ ...prev, [taskId]: data as Comment[] }));
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast({ title: "Preencha o título da tarefa", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const aiRes = await supabase.functions.invoke("categorize-task", {
        body: { title, description },
      });
      const priority = aiRes.data?.priority || "media";
      const suggestion = aiRes.data?.suggestion || null;

      const { error } = await supabase.from("tasks").insert({
        user_id: user!.id,
        title: title.trim(),
        description: description.trim() || null,
        priority: priority as any,
        ai_suggestion: suggestion,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
      if (error) throw error;
      toast({
        title: "Tarefa criada com sucesso!",
        description: `Prioridade definida pela IA: ${priorityConfig[priority]?.label || priority}`,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowForm(false);
      fetchTasks();
    } catch (e: any) {
      toast({ title: "Erro ao criar tarefa", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await supabase.from("tasks").update({ status: newStatus as any }).eq("id", taskId);
    fetchTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchTasks();
  };

  const handleAddComment = async (taskId: string) => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    const authorName = user?.user_metadata?.full_name || user?.email || "Anônimo";
    const { error } = await supabase.from("task_comments").insert({
      task_id: taskId,
      user_id: user!.id,
      content: commentText.trim(),
      author_name: authorName,
    });
    if (!error) {
      setCommentText("");
      fetchComments(taskId);
    }
    setSendingComment(false);
  };

  const toggleTask = (taskId: string) => {
    if (expandedTask === taskId) {
      setExpandedTask(null);
    } else {
      setExpandedTask(taskId);
      if (!comments[taskId]) fetchComments(taskId);
    }
  };

  const filteredTasks = useMemo(() => {
    if (filterPriority === "all") return tasks;
    return tasks.filter((t) => t.priority === filterPriority);
  }, [tasks, filterPriority]);

  // Reports data
  const stats = useMemo(() => {
    const total = tasks.length;
    const concluidas = tasks.filter((t) => t.status === "concluida").length;
    const emAndamento = tasks.filter((t) => t.status === "em_andamento").length;
    const pendentes = tasks.filter((t) => t.status === "pendente").length;
    const urgentes = tasks.filter((t) => t.priority === "urgente" || t.priority === "alta").length;
    const atrasadas = tasks.filter((t) => {
      if (!t.due_date || t.status === "concluida" || t.status === "cancelada") return false;
      return new Date(t.due_date) < new Date();
    }).length;
    const cumprimento = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { total, concluidas, emAndamento, pendentes, urgentes, atrasadas, cumprimento };
  }, [tasks]);

  const priorityDistribution = useMemo(() => {
    const dist = { baixa: 0, media: 0, alta: 0, urgente: 0 };
    tasks.forEach((t) => { if (dist[t.priority as keyof typeof dist] !== undefined) dist[t.priority as keyof typeof dist]++; });
    return dist;
  }, [tasks]);

  // Alerts
  const alertTasks = useMemo(() => {
    return tasks
      .filter((t) => t.due_date && t.status !== "concluida" && t.status !== "cancelada")
      .map((t) => ({ ...t, alert: getDueDateAlert(t.due_date) }))
      .filter((t) => t.alert && (t.alert.label === "Atrasada" || t.alert.label === "Vence hoje" || t.alert.label.startsWith("Vence em")))
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
  }, [tasks]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" />;

  const renderTaskCard = (task: Task, compact = false) => {
    const pConfig = priorityConfig[task.priority] || priorityConfig.media;
    const sConfig = statusConfig[task.status] || statusConfig.pendente;
    const isExpanded = expandedTask === task.id;
    const dueDateAlert = getDueDateAlert(task.due_date);

    return (
      <Card
        key={task.id}
        className={`border border-border transition-all duration-300 hover:shadow-md ${compact ? `border-l-4 ${pConfig.kanbanBorder}` : ""}`}
      >
        <div className={compact ? "p-3" : "p-5"}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <h3 className={`font-semibold text-foreground truncate ${compact ? "text-sm" : ""}`}>{task.title}</h3>
                <Badge variant="outline" className={`text-[10px] ${pConfig.color} border`}>{pConfig.label}</Badge>
                {dueDateAlert && (
                  <Badge variant="outline" className={`text-[10px] gap-1 ${dueDateAlert.className}`}>
                    <CalendarClock className="h-2.5 w-2.5" /> {dueDateAlert.label}
                  </Badge>
                )}
              </div>
              {!compact && task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
              )}
              {!compact && task.ai_suggestion && (
                <div className="mt-2 flex items-start gap-2 rounded-md bg-primary/5 p-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-primary">{task.ai_suggestion}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {compact ? (
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="text-[10px] border border-input rounded px-1 py-0.5 bg-background"
                >
                  {kanbanColumns.map((s) => (
                    <option key={s} value={s}>{statusConfig[s]?.label}</option>
                  ))}
                </select>
              ) : (
                <>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="text-xs border border-input rounded-md px-2 py-1 bg-background"
                  >
                    {kanbanColumns.map((s) => (
                      <option key={s} value={s}>{statusConfig[s]?.label}</option>
                    ))}
                  </select>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleTask(task.id)}>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Comments */}
          {!compact && isExpanded && (
            <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Comentários</span>
              </div>
              <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                {(comments[task.id] || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">Nenhum comentário ainda.</p>
                ) : (
                  (comments[task.id] || []).map((c) => (
                    <div key={c.id} className="rounded-md bg-muted/50 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{c.author_name || "Colaborador"}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Escreva um comentário..."
                  value={expandedTask === task.id ? commentText : ""}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment(task.id)}
                  className="text-sm"
                />
                <Button size="icon" onClick={() => handleAddComment(task.id)} disabled={sendingComment || !commentText.trim()} className="shrink-0">
                  {sendingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
        {!compact && (
          <div className="px-5 py-2 bg-muted/30 border-t border-border rounded-b-lg flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Criada em {new Date(task.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
            {task.due_date && (
              <span className="text-xs text-muted-foreground">
                Prazo: {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/"><Logo size="sm" /></Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.user_metadata?.full_name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Alerts Banner */}
        {alertTasks.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Alertas de Prazo ({alertTasks.length})</span>
            </div>
            <div className="space-y-1.5">
              {alertTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className={`text-[10px] ${t.alert!.className}`}>{t.alert!.label}</Badge>
                  <span className="text-amber-900 truncate">{t.title}</span>
                  {t.due_date && (
                    <span className="text-xs text-amber-600 shrink-0">
                      {new Date(t.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Tarefas</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie suas tarefas com inteligência artificial</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${viewMode === "kanban" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
              >
                <List className="h-3.5 w-3.5" /> Lista
              </button>
              <button
                onClick={() => setViewMode("reports")}
                className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 transition-colors ${viewMode === "reports" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
              >
                <BarChart3 className="h-3.5 w-3.5" /> Relatórios
              </button>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" /> Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Filter */}
        {viewMode !== "reports" && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-muted-foreground">Filtrar:</span>
            {["all", "urgente", "alta", "media", "baixa"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${filterPriority === p ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/50"}`}
              >
                {p === "all" ? "Todas" : priorityConfig[p]?.label || p}
              </button>
            ))}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <Card className="p-6 mb-6 border border-border animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Nova Tarefa</h2>
              <span className="text-xs text-muted-foreground ml-2">A IA definirá a prioridade automaticamente</span>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Título da tarefa (ex: Preparar petição inicial do caso Silva)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Descreva a tarefa em linguagem natural..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-auto"
                    placeholder="Prazo"
                  />
                </div>
                <span className="text-xs text-muted-foreground">Defina um prazo para receber alertas inteligentes</span>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreateTask} disabled={creating} className="gap-2">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {creating ? "Analisando com IA..." : "Criar Tarefa"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          </Card>
        )}

        {/* KANBAN VIEW */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {kanbanColumns.map((status) => {
              const sConf = statusConfig[status];
              const columnTasks = filteredTasks.filter((t) => t.status === status);
              return (
                <div key={status} className="flex flex-col">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg ${sConf.color}`}>
                    {sConf.icon}
                    <span className="text-sm font-semibold">{sConf.label}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5 min-w-5 flex items-center justify-center">{columnTasks.length}</Badge>
                  </div>
                  <div className="flex-1 bg-muted/30 border border-t-0 border-border rounded-b-lg p-2 space-y-2 min-h-[200px]">
                    {columnTasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">Nenhuma tarefa</p>
                    ) : (
                      columnTasks.map((task) => renderTaskCard(task, true))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <div className="animate-in fade-in duration-300">
            {filteredTasks.length === 0 ? (
              <Card className="p-12 text-center border border-dashed border-border">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma tarefa criada</h3>
                <p className="text-muted-foreground text-sm">Crie sua primeira tarefa e a IA irá categorizar automaticamente.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => renderTaskCard(task, false))}
              </div>
            )}
          </div>
        )}

        {/* REPORTS VIEW */}
        {viewMode === "reports" && (
          <div className="animate-in fade-in duration-300 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total de Tarefas", value: stats.total, icon: LayoutGrid, color: "text-primary" },
                { label: "Concluídas", value: stats.concluidas, icon: CheckCircle2, color: "text-emerald-600" },
                { label: "Em Andamento", value: stats.emAndamento, icon: Loader2, color: "text-amber-500" },
                { label: "Atrasadas", value: stats.atrasadas, icon: AlertTriangle, color: "text-destructive" },
              ].map((s) => (
                <Card key={s.label} className="p-4 border border-border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex items-center gap-2 mb-2">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{s.value}</p>
                </Card>
              ))}
            </div>

            {/* Progress & Priority */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Completion Rate */}
              <Card className="p-5 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Índice de Cumprimento</span>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-5xl font-bold text-primary">{stats.cumprimento}%</span>
                  <span className="text-sm text-muted-foreground mb-1">das tarefas concluídas</span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                    style={{ width: `${stats.cumprimento}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{stats.concluidas} concluídas</span>
                  <span className="text-xs text-muted-foreground">{stats.total} total</span>
                </div>
              </Card>

              {/* Priority Distribution */}
              <Card className="p-5 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Distribuição por Prioridade</span>
                </div>
                <div className="space-y-3">
                  {(["urgente", "alta", "media", "baixa"] as const).map((p) => {
                    const count = priorityDistribution[p];
                    const maxCount = Math.max(...Object.values(priorityDistribution), 1);
                    const pConf = priorityConfig[p];
                    return (
                      <div key={p} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">{pConf.label}</span>
                          <span className="text-xs text-muted-foreground">{count} tarefa{count !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${p === "urgente" ? "bg-red-500" : p === "alta" ? "bg-orange-400" : p === "media" ? "bg-amber-400" : "bg-emerald-400"}`}
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Status breakdown */}
            <Card className="p-5 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <LayoutGrid className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Visão por Status</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {kanbanColumns.map((status) => {
                  const count = tasks.filter((t) => t.status === status).length;
                  const sConf = statusConfig[status];
                  return (
                    <div
                      key={status}
                      className="flex flex-col items-center p-4 rounded-lg border border-border hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => { setViewMode("kanban"); }}
                    >
                      <div className={`rounded-full p-2 mb-2 ${sConf.color}`}>{sConf.icon}</div>
                      <span className="text-2xl font-bold text-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground">{sConf.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tarefas;

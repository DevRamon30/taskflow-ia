import { useState, useEffect } from "react";
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
import { LogOut, Plus, MessageSquare, Send, Loader2, Sparkles, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
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
};

type Comment = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  author_name: string | null;
  created_at: string;
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: "Baixa", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  media: { label: "Média", color: "bg-amber-100 text-amber-700 border-amber-200" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-200" },
  urgente: { label: "Urgente", color: "bg-red-100 text-red-700 border-red-200" },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  pendente: { label: "Pendente", icon: <Clock className="h-3.5 w-3.5" /> },
  em_andamento: { label: "Em Andamento", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  concluida: { label: "Concluída", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  cancelada: { label: "Cancelada", icon: <XCircle className="h-3.5 w-3.5" /> },
};

const Tarefas = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

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
      // Call AI to categorize
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
      });

      if (error) throw error;

      toast({
        title: "Tarefa criada com sucesso!",
        description: `Prioridade definida pela IA: ${priorityConfig[priority]?.label || priority}`,
      });
      setTitle("");
      setDescription("");
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

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" />;

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

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Tarefas</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie suas tarefas com inteligência artificial</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="h-4 w-4" /> Nova Tarefa
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="p-6 mb-8 border border-border animate-in fade-in slide-in-from-top-2 duration-300">
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
                placeholder="Descreva a tarefa em linguagem natural... (ex: Preciso elaborar a petição inicial para o caso do cliente João Silva sobre rescisão contratual. O prazo é até sexta-feira.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
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

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <Card className="p-12 text-center border border-dashed border-border">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma tarefa criada</h3>
            <p className="text-muted-foreground text-sm">Crie sua primeira tarefa e a IA irá categorizar automaticamente.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const pConfig = priorityConfig[task.priority] || priorityConfig.media;
              const sConfig = statusConfig[task.status] || statusConfig.pendente;
              const isExpanded = expandedTask === task.id;

              return (
                <Card
                  key={task.id}
                  className="border border-border transition-all duration-300 hover:shadow-md"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-foreground truncate">{task.title}</h3>
                          <Badge variant="outline" className={`text-xs ${pConfig.color} border`}>
                            {pConfig.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs gap-1">
                            {sConfig.icon} {sConfig.label}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                        )}
                        {task.ai_suggestion && (
                          <div className="mt-2 flex items-start gap-2 rounded-md bg-primary/5 p-2.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                            <p className="text-xs text-primary">{task.ai_suggestion}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="text-xs border border-input rounded-md px-2 py-1 bg-background"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="em_andamento">Em Andamento</option>
                          <option value="concluida">Concluída</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleTask(task.id)}>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">Comentários</span>
                        </div>

                        {/* Comments List */}
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

                        {/* Add Comment */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Escreva um comentário..."
                            value={expandedTask === task.id ? commentText : ""}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddComment(task.id)}
                            className="text-sm"
                          />
                          <Button
                            size="icon"
                            onClick={() => handleAddComment(task.id)}
                            disabled={sendingComment || !commentText.trim()}
                            className="shrink-0"
                          >
                            {sendingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-2 bg-muted/30 border-t border-border rounded-b-lg">
                    <span className="text-xs text-muted-foreground">
                      Criada em {new Date(task.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tarefas;

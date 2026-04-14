import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um assistente jurídico especializado em categorizar tarefas. Analise o título e descrição da tarefa e retorne APENAS uma das prioridades: "baixa", "media", "alta", "urgente". Também forneça uma breve sugestão de próximos passos (máximo 2 frases).

Critérios:
- urgente: prazos judiciais próximos, audiências, citações, intimações com prazo curto
- alta: contratos com deadline, processos em andamento, reuniões importantes  
- media: tarefas administrativas com prazo, revisões de documentos, pareceres
- baixa: organização interna, arquivamento, tarefas sem prazo definido`,
          },
          {
            role: "user",
            content: `Título: ${title}\nDescrição: ${description || "Sem descrição adicional"}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "categorize_task",
              description: "Categoriza a prioridade da tarefa e sugere próximos passos",
              parameters: {
                type: "object",
                properties: {
                  priority: { type: "string", enum: ["baixa", "media", "alta", "urgente"] },
                  suggestion: { type: "string", description: "Breve sugestão de próximos passos" },
                },
                required: ["priority", "suggestion"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "categorize_task" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ priority: "media", suggestion: "Não foi possível categorizar automaticamente." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ priority: "media", suggestion: "Tarefa registrada com prioridade padrão." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ priority: "media", suggestion: "Erro ao categorizar. Prioridade padrão aplicada." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

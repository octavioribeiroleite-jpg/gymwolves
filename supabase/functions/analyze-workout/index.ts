import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { mode, workoutType, intensity, durationMin, imageBase64 } = await req.json();

    let messages: any[];

    if (mode === "image" && imageBase64) {
      messages = [
        {
          role: "system",
          content:
            "You are a fitness data extraction assistant. Analyze the screenshot from a fitness/health app and extract workout data. Always respond using the provided tool. Extract whatever data you can see: calories, duration, heart rate, distance, steps, workout type. If you can't determine a value, omit it. For workout_type use one of: musculacao, corrida, crossfit, natacao, ciclismo, yoga, luta, caminhada, aerobio, outro. For summary, write a brief description in Portuguese.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this fitness app screenshot and extract all workout data you can find.",
            },
            {
              type: "image_url",
              image_url: { url: imageBase64 },
            },
          ],
        },
      ];
    } else {
      const intensityMap: Record<string, string> = {
        leve: "light intensity, low effort",
        moderado: "moderate intensity, steady effort",
        pesado: "high intensity, maximum effort",
      };
      const workoutTypeMap: Record<string, string> = {
        musculacao: "weight training / strength training",
        corrida: "running",
        crossfit: "CrossFit",
        natacao: "swimming",
        ciclismo: "cycling",
        yoga: "yoga",
        luta: "martial arts / fighting",
        caminhada: "walking",
        aerobio: "aerobic exercise",
        outro: "general exercise",
      };

      const typeLabel = workoutTypeMap[workoutType] || workoutType || "general exercise";
      const intensityLabel = intensityMap[intensity] || intensity || "moderate";
      const duration = durationMin || 30;

      messages = [
        {
          role: "system",
          content:
            "You are a fitness calorie estimation assistant. Estimate calories burned based on workout type, intensity, and duration. Use established MET values for accuracy. Always respond using the provided tool. For summary, write a brief motivational description in Portuguese.",
        },
        {
          role: "user",
          content: `Estimate calories burned for this workout:\n- Type: ${typeLabel}\n- Intensity: ${intensityLabel}\n- Duration: ${duration} minutes\n\nProvide your best estimate based on an average adult (70kg).`,
        },
      ];
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages,
      tools: [
        {
          type: "function",
          function: {
            name: "workout_analysis",
            description: "Return the analyzed workout data with estimated metrics.",
            parameters: {
              type: "object",
              properties: {
                workout_type: {
                  type: "string",
                  enum: [
                    "musculacao", "corrida", "crossfit", "natacao",
                    "ciclismo", "yoga", "luta", "caminhada", "aerobio", "outro",
                  ],
                  description: "Type of workout",
                },
                duration_min: {
                  type: "number",
                  description: "Duration in minutes",
                },
                calories: {
                  type: "number",
                  description: "Estimated calories burned",
                },
                heart_rate: {
                  type: "number",
                  description: "Average heart rate if available",
                },
                distance_km: {
                  type: "number",
                  description: "Distance in km if applicable",
                },
                steps: {
                  type: "number",
                  description: "Step count if available",
                },
                summary: {
                  type: "string",
                  description: "Brief summary of the workout in Portuguese",
                },
              },
              required: ["workout_type", "calories", "summary"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "workout_analysis" } },
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos ao seu workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro ao analisar treino" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "IA não retornou dados estruturados" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysisData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-workout error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Modelos disponíveis via SambaNova Cloud (SAMBANOVA_API_KEY)
// Atualizado em 2026-08-19 conforme painel SambaNova
export const DEFAULT_CHAT_MODEL = "Meta-Llama-3.3-70B-Instruct";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "Meta-Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B",
    provider: "sambanova",
    description: "Rápido e eficiente para tarefas do dia a dia",
  },
  {
    id: "DeepSeek-V3-0324",
    name: "DeepSeek V3.1",
    provider: "sambanova",
    description: "Alta performance geral",
  },
  {
    id: "DeepSeek-R1",
    name: "DeepSeek V3.2",
    provider: "sambanova",
    description: "Raciocínio avançado para problemas complexos",
  },
  {
    id: "MiniMax-M2.7",
    name: "MiniMax M2.7",
    provider: "sambanova",
    description: "Modelo multilingual eficiente",
  },
  {
    id: "gemma-4-31B-it",
    name: "Gemma 4 31B",
    provider: "sambanova",
    description: "Modelo Google com suporte a visão",
  },
  {
    id: "gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "sambanova",
    description: "Modelo OpenAI open-source de grande porte",
  },
];

// Group models by provider for UI
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

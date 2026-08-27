// Modelos disponíveis via OpenRouter (OPENROUTER_API_KEY)
// IDs no formato "provider/model:tier" — sufixo ":free" = gratuito
export const DEFAULT_CHAT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    provider: "openrouter",
    description: "Rápido e eficiente para tarefas do dia a dia",
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek V3",
    provider: "openrouter",
    description: "Alta performance geral",
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1",
    provider: "openrouter",
    description: "Raciocínio avançado para problemas complexos",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    provider: "openrouter",
    description: "Modelo Google eficiente e multilingual",
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B",
    provider: "openrouter",
    description: "Modelo leve e veloz",
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

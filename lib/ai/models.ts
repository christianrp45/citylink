// Modelos disponíveis via SambaNova Cloud (SAMBANOVA_API_KEY)
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
    id: "Meta-Llama-3.1-405B-Instruct",
    name: "Llama 3.1 405B",
    provider: "sambanova",
    description: "Modelo mais capaz para tarefas complexas",
  },
  {
    id: "DeepSeek-R1",
    name: "DeepSeek R1",
    provider: "sambanova",
    description: "Raciocínio avançado para problemas complexos",
  },
  {
    id: "DeepSeek-V3-0324",
    name: "DeepSeek V3",
    provider: "sambanova",
    description: "Alta performance geral",
  },
  {
    id: "Qwen3-32B",
    name: "Qwen 3 32B",
    provider: "sambanova",
    description: "Multilingual com bom desempenho em português",
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

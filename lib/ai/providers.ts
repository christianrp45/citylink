import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

const THINKING_SUFFIX_REGEX = /-thinking$/;

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : null;

// Provedor SambaNova — OpenAI-compatible, usa SAMBANOVA_API_KEY
const sambaNova = createOpenAI({
  baseURL: "https://api.sambanova.ai/v1",
  apiKey: process.env.SAMBANOVA_API_KEY ?? "",
});

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const isReasoningModel =
    modelId.includes("reasoning") || modelId.endsWith("-thinking");

  if (isReasoningModel) {
    const baseModelId = modelId.replace(THINKING_SUFFIX_REGEX, "");
    return wrapLanguageModel({
      model: sambaNova(baseModelId) as unknown as LanguageModelV3,
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  return sambaNova(modelId) as unknown as LanguageModelV3;
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return sambaNova("Meta-Llama-3.3-70B-Instruct") as unknown as LanguageModelV3;
}

export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  return sambaNova("Meta-Llama-3.3-70B-Instruct") as unknown as LanguageModelV3;
}

// Modelo para Teo e funcionalidades pastorais
export function getFreeModel() {
  return sambaNova("Meta-Llama-3.3-70B-Instruct") as unknown as LanguageModelV3;
}

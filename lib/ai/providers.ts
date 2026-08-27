import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
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

// Google Gemini — genuinamente gratuito (1M tokens/dia), usa GOOGLE_AI_KEY
const _google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_KEY ?? "",
});

// OpenRouter — fallback, usa OPENROUTER_API_KEY
const _or = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  name: "openrouter",
  headers: {
    "HTTP-Referer": "https://app.emetis.com.br",
    "X-Title": "Emetis",
  },
});
const or = (modelId: string) => _or.chat(modelId) as unknown as LanguageModelV3;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const isReasoningModel =
    modelId.includes("reasoning") || modelId.endsWith("-thinking");

  if (isReasoningModel) {
    const baseModelId = modelId.replace(THINKING_SUFFIX_REGEX, "");
    return wrapLanguageModel({
      model: or(baseModelId),
      middleware: extractReasoningMiddleware({ tagName: "thinking" }),
    });
  }

  return or(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return _google("gemini-3.6-flash-lite") as unknown as LanguageModelV3;
}

export function getArtifactModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("artifact-model");
  }
  return _google("gemini-3.6-flash-lite") as unknown as LanguageModelV3;
}

// Modelo principal para Teo e funcionalidades pastorais — Gemini Flash
export function getFreeModel() {
  return _google("gemini-3.6-flash") as unknown as LanguageModelV3;
}

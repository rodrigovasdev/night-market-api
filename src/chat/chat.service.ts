import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';

interface ChatProductSummary {
  id: number;
  name: string;
  shortDescription: string;
  price: number;
  imageUrl: string | null;
}

export type GeminiChatRole = 'user' | 'model';

export interface GeminiChatTurn {
  role: GeminiChatRole;
  text: string;
}

interface GenerateReplyParams {
  message: string;
  history: GeminiChatTurn[];
}

interface GenerateReplyResult {
  reply: string;
  history: GeminiChatTurn[];
  products?: ChatProductSummary[];
}

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  role?: string;
  parts?: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
}

@Injectable()
export class ChatService {
  private readonly apiKey: string;
  private readonly modelName: string;
  private readonly systemInstruction: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? '';
    this.modelName = this.configService.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    this.systemInstruction =
      this.configService.get<string>('GEMINI_SYSTEM_PROMPT') ??
      'Eres el asistente virtual de Night Market. Responde en espanol, se claro, breve y util para clientes de ecommerce.';
  }

  getModelName() {
    return this.modelName;
  }

  async generateReply({ message, history }: GenerateReplyParams): Promise<GenerateReplyResult> {
    const trimmedMessage = message.trim();
    const nextHistory: GeminiChatTurn[] = [...history, { role: 'user', text: trimmedMessage }];

    if (this.isProductAvailabilityQuestion(trimmedMessage)) {
      const products = await this.getAvailableProducts();
      const reply = this.buildAvailableProductsReply(products);

      return {
        reply,
        products,
        history: [...nextHistory, { role: 'model', text: reply }],
      };
    }

    if (!this.apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY is not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: this.systemInstruction }],
          },
          contents: nextHistory.map((turn) => ({
            role: turn.role === 'model' ? 'model' : 'user',
            parts: [{ text: turn.text }],
          })),
        }),
      },
    );

    const payload = (await response.json()) as GeminiResponse;

    if (!response.ok) {
      throw new InternalServerErrorException(payload.error?.message ?? 'Gemini request failed');
    }

    const reply = payload.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text?.trim())
      .filter((part): part is string => Boolean(part))
      .join('\n')
      .trim();

    if (!reply) {
      throw new InternalServerErrorException('Gemini returned an empty response');
    }

    return {
      reply,
      history: [...nextHistory, { role: 'model', text: reply }],
    };
  }

  private isProductAvailabilityQuestion(message: string) {
    const normalizedMessage = message
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    return [
      /que productos hay/,
      /que productos tienen/,
      /productos disponibles/,
      /que hay disponible/,
      /que venden/,
      /catalogo/,
      /muestrame los productos/,
      /mostrame los productos/,
    ].some((pattern) => pattern.test(normalizedMessage));
  }

  private async getAvailableProducts(): Promise<ChatProductSummary[]> {
    const products = await this.productsService.findAll();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription,
      price: Number(product.price),
      imageUrl: product.images?.[0]?.url ?? null,
    }));
  }

  private buildAvailableProductsReply(products: ChatProductSummary[]) {
    if (!products.length) {
      return 'Ahora mismo no hay productos disponibles en el catalogo.';
    }

    const lines = products.map(
      (product) => `- ${product.name}: ${product.shortDescription} ($${product.price.toFixed(0)})`,
    );

    return ['Estos son los productos disponibles en este momento:', ...lines].join('\n');
  }
}
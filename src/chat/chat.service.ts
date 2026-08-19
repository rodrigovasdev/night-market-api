import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';
import { CHAT_DEFAULT_SYSTEM_PROMPT } from './config/chat.prompts';
import { CHAT_TOOLS } from './config/chat.tools';

interface ChatProductSummary {
  id: number;
  name: string;
  shortDescription: string;
  price: number;
  imageUrl: string | null;
}

export type GroqChatRole = 'user' | 'assistant';

export interface GroqChatTurn {
  role: GroqChatRole;
  text: string;
}

interface GenerateReplyParams {
  message: string;
  history: GroqChatTurn[];
}

interface GenerateReplyResult {
  reply: string;
  history: GroqChatTurn[];
  products?: ChatProductSummary[];
}

interface GroqToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface GroqMessage {
  role: string;
  content: string | null;
  tool_calls?: GroqToolCall[];
  tool_call_id?: string;
}

interface GroqChoice {
  message?: GroqMessage;
}

interface GroqResponse {
  choices?: GroqChoice[];
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
    this.apiKey = this.configService.get<string>('GROQ_API_KEY') ?? '';
    this.modelName =
      this.configService.get<string>('GROQ_MODEL') ?? 'openai/gpt-oss-120b';
    this.systemInstruction =
      this.configService.get<string>('GROQ_SYSTEM_PROMPT') ?? CHAT_DEFAULT_SYSTEM_PROMPT;
  }

  getModelName() {
    return this.modelName;
  }

  async generateReply({ message, history }: GenerateReplyParams): Promise<GenerateReplyResult> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY is not configured');
    }

    const trimmedMessage = message.trim();
    const nextHistory: GroqChatTurn[] = [...history, { role: 'user', text: trimmedMessage }];

    const messages: GroqMessage[] = [
      { role: 'system', content: this.systemInstruction },
      ...nextHistory.map((turn) => ({
        role: turn.role === 'assistant' ? 'assistant' : 'user',
        content: turn.text,
      })),
    ];

    const firstPayload = await this.callGroq(messages, this.buildTools());
    const assistantMessage = firstPayload.choices?.[0]?.message;

    if (assistantMessage?.tool_calls?.length) {
      const allProductsCall = assistantMessage.tool_calls.find(
        (tc) => tc.function.name === 'get_available_products',
      );

      if (allProductsCall) {
        const products = await this.getAvailableProducts();

        const reply = products.length
          ? 'Aquí tienes los productos disponibles en este momento:'
          : 'Por el momento no hay productos disponibles en el catálogo.';

        return {
          reply,
          products,
          history: [...nextHistory, { role: 'assistant', text: reply }],
        };
      }

      const searchCall = assistantMessage.tool_calls.find(
        (tc) => tc.function.name === 'get_product_by_name',
      );

      if (searchCall) {
        const args = JSON.parse(searchCall.function.arguments) as { terms: string[] };
        const products = await this.searchProducts(args.terms);
        const query = args.terms[0] ?? 'ese producto';

        const reply = products.length
          ? `Aquí tienes los resultados para "${query}":`
          : `No encontré productos que coincidan con "${query}".`;

        return {
          reply,
          products,
          history: [...nextHistory, { role: 'assistant', text: reply }],
        };
      }
    }

    const reply = this.extractTextReply(firstPayload);

    return {
      reply,
      history: [...nextHistory, { role: 'assistant', text: reply }],
    };
  }

  private buildTools() {
    return CHAT_TOOLS;
  }

  private async callGroq(messages: GroqMessage[], tools?: readonly unknown[]): Promise<GroqResponse> {
    const body: Record<string, unknown> = {
      model: this.modelName,
      messages,
    };

    if (tools?.length) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as GroqResponse;

    if (!response.ok) {
      throw new InternalServerErrorException(payload.error?.message ?? 'Groq request failed');
    }

    return payload;
  }

  private extractTextReply(payload: GroqResponse): string {
    const reply = payload.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new InternalServerErrorException('Groq returned an empty response');
    }

    return reply;
  }

  private async searchProducts(terms: string[]): Promise<ChatProductSummary[]> {
    const products = await this.productsService.searchByTerms(terms);

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      shortDescription: product.shortDescription,
      price: Number(product.price),
      imageUrl: product.images?.[0]?.url ?? null,
    }));
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
}
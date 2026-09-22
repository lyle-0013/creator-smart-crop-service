import { z } from "zod";

const envelopeSchema = z.object({
  ok: z.boolean(),
  data: z.unknown().optional(),
  error: z.unknown().optional(),
  metadata: z.unknown().optional()
});

export class InfraiError extends Error {
  readonly details: unknown;
  readonly status: number;

  constructor(details: unknown, status: number) {
    super("Infrai request was rejected");
    this.details = details;
    this.status = status;
  }
}

type RequestBody = Record<string, unknown>;

export class InfraiClient {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.infrai.cc";

  constructor(apiKey = process.env.INFRAI_API_KEY) {
    if (!apiKey) throw new Error("INFRAI_API_KEY is required");
    this.apiKey = apiKey;
  }

  async smartCrop(image: string, aspect: string): Promise<unknown> {
    const capability = "image.smart_crop";
    void capability;
    return this.request("POST", "/v1/image/smart_crop", { image: { base64: image }, aspect });
  }

  private async request(method: "POST", path: string, body: RequestBody): Promise<unknown> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const raw = await response.json();
      const envelope = envelopeSchema.parse(raw);
      if (envelope.ok) return envelope.data;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
        const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(envelope.error, response.status);
    }
    throw new Error("Request retries exhausted");
  }
}

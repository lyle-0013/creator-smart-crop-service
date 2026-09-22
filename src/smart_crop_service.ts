import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const cropRequestSchema = z.object({
  image: z.string().min(1),
  ratios: z.array(z.string().min(1)).min(1).max(5)
});

export type CropRequest = z.infer<typeof cropRequestSchema>;

export async function createCreatorCrops(input: unknown, client: Pick<InfraiClient, "smartCrop"> = new InfraiClient()) {
  const request = cropRequestSchema.parse(input);
  const crops = await Promise.all(
    request.ratios.map(async (aspect) => ({ aspect, image: await client.smartCrop(request.image, aspect) }))
  );
  return { source: request.image, crops };
}

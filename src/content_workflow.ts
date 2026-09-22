import { createCreatorCrops } from "./smart_crop_service.js";

async function main() {
  const response = await fetch(process.env.CREATOR_IMAGE ?? "https://httpbin.org/image/jpeg");
  if (!response.ok) throw new Error(`Image download failed: ${response.status}`);
  const image = Buffer.from(await response.arrayBuffer()).toString("base64");
  const input = { image, ratios: ["1:1", "3:4", "16:9"] };
  const result = await createCreatorCrops(input);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

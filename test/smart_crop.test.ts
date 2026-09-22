import assert from "node:assert/strict";
import { createCreatorCrops } from "../src/smart_crop_service.js";

const calls: Array<{ image: string; aspect: string }> = [];
const fakeClient = {
  async smartCrop(image: string, aspect: string) {
    calls.push({ image, aspect });
    return `cdn://${aspect}`;
  }
};

const result = await createCreatorCrops(
  { image: "asset-42", ratios: ["1:1", "4:5"] },
  fakeClient
);

assert.deepEqual(result, {
  source: "asset-42",
  crops: [
    { aspect: "1:1", image: "cdn://1:1" },
    { aspect: "4:5", image: "cdn://4:5" }
  ]
});
assert.deepEqual(calls, [
  { image: "asset-42", aspect: "1:1" },
  { image: "asset-42", aspect: "4:5" }
]);
console.log("smart crop decision test passed");

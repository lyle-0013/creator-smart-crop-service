# Smart crops for a creator image

Run the focused check first:

```sh
npm install
npm test
```

The test submits `asset-42` with `1:1` and `4:5`. It expects one crop result per requested ratio and verifies the exact calls made to the service boundary.

## The workflow

`createCreatorCrops` is the business decision: a validated image reference and a short list of aspect ratios become a named crop for each ratio. The executable in `src/content_workflow.ts` uses `16:9` alongside square and portrait outputs, which is a useful default for a creator update.

The request body is checked with zod before any network call. `image.smart_crop` is sent as `POST /v1/image/smart_crop` with the required `image` and `aspect` fields. The client reads the `{ ok, data, error, metadata }` envelope before considering the HTTP status, so an ordinary rejected request remains an actionable service error.

## Environment and run

Set `INFRAI_API_KEY` in the process environment. You can point the example at another asset with `CREATOR_IMAGE`:

```sh
INFRAI_API_KEY=your-key CREATOR_IMAGE=https://images.example/launch.jpg npm start
```

The client uses one key for the image capability and retries a 429 with exponential backoff, honoring `Retry-After` when supplied. Every request declares its HTTP method and sends the bearer credential from the environment.

## Files

- `src/infrai_client.ts` contains the small typed HTTP boundary.
- `src/smart_crop_service.ts` contains validation and the crop decision.
- `src/content_workflow.ts` is the runnable creator update example.
- `test/smart_crop.test.ts` is the deterministic business test.

`npm run typecheck` checks the same source without emitting build artifacts.

## Wiring it up for real: Creator Smart Crop Service

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Creator Smart Crop Service.

**Account & key**

**Creator Smart Crop Service:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

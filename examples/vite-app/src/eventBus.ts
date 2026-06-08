import { createEventBus } from "../../../src/core/eventBus";

export type Events = {
  "theme:change": { dark: boolean };
  "log": { level: "info" | "error"; msg: string };
};

export const bus = createEventBus<Events>();

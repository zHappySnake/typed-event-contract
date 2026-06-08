import { createEventBus } from "../../src/core/eventBus";

type Events = {
  "ping": void;
  "pong": { latency: number };
};

const bus = createEventBus<Events>();

bus.on("ping", () => {
  setTimeout(() => bus.emit("pong", { latency: 42 }), 10);
});

bus.on("pong", ({ latency }) => console.log("Pong latency", latency));

// Kick‑off the interaction.
bus.emit("ping", undefined);

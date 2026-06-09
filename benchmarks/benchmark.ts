import { createEventBus } from "../src/core/eventBus";
import { performance } from "node:perf_hooks";

type Events = {
  "benchmark:event": { id: number };
};

function benchmark(iterations: number) {
  const bus = createEventBus<Events>();

  // Register a simple listener that does minimal work.
  bus.on("benchmark:event", ({ id }) => {
    // No‑op – just touch the value.
    void id;
  });

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    bus.emit("benchmark:event", { id: i });
  }
  const end = performance.now();
  console.log(`Emitted ${iterations.toLocaleString()} events in ${(end - start).toFixed(2)} ms`);
}

// Run a default benchmark of 1 000 000 iterations.
benchmark(1_000_000);

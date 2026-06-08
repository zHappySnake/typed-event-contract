import { bus } from "./eventBus";

// Register a listener for theme changes.
bus.on("theme:change", ({ dark }) => {
  document.body.dataset.theme = dark ? "dark" : "light";
});

// Example of emitting a log event.
bus.emit("log", { level: "info", msg: "Vite app started" });

// Export for potential further use.
export default bus;

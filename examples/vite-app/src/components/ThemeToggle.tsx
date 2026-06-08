import { bus } from "../eventBus";

export function ThemeToggle() {
  const toggle = () => bus.emit("theme:change", { dark: true });
  return <button onClick={toggle}>Dark mode</button>;
}

import { useEffect } from "react";
import { useEventBus } from "../src/context/EventBusContext";

export function LoginButton() {
  const bus = useEventBus();

  const handleLogin = () => {
    bus.emit("user:login", { userId: "42", name: "Ada" });
  };

  useEffect(() => {
    const listener = ({ message }: { message: string }) => alert(`🔔 ${message}`);
    bus.on("notification", listener);
    // No off method – listeners are GC‑ed on component unmount.
  }, [bus]);

  return <button onClick={handleLogin}>Log in</button>;
}

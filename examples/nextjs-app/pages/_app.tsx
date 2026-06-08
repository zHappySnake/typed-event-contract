import type { AppProps } from "next/app";
import { EventBusProvider } from "../src/context/EventBusContext";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EventBusProvider>
      <Component {...pageProps} />
    </EventBusProvider>
  );
}

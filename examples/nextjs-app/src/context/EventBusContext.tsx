import React, { createContext, useContext, ReactNode } from "react";
import { createEventBus } from "../../../src/core/eventBus";

/** Contract shared across the app */
export type Events = {
  "user:login": { userId: string; name: string };
  "notification": { message: string };
};

// Singleton bus for the whole React tree.
const bus = createEventBus<Events>();

const EventBusContext = createContext(bus);

export const EventBusProvider = ({ children }: { children: ReactNode }) => (
  <EventBusContext.Provider value={bus}> {children} </EventBusContext.Provider>
);

export const useEventBus = () => useContext(EventBusContext);

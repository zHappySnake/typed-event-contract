/**
 * Generic transport interface for the typed event contract system.
 *
 * A `Transport` abstracts the way events are sent and received.
 * Implementations may forward events in-process (LocalTransport) or
 * across runtimes (WebSocketTransport, etc.).
 */
export interface Transport<T extends Record<string, any>> {
  /**
   * Send an event with a payload matching the contract.
   */
  send<E extends keyof T>(event: E, payload: T[E]): void;

  /**
   * Register a listener for a specific event.
   */
  on<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void;
}

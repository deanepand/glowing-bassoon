// Event Emitter - Pub/Sub Pattern Implementation
// A lightweight event system for decoupled communication

class EventEmitter {
  constructor() {
    this.listeners = new Map();
    this.maxListeners = 10;
  }

  on(event, callback, options = {}) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const listeners = this.listeners.get(event);

    if (listeners.length >= this.maxListeners) {
      console.warn(
        `Warning: ${event} has ${listeners.length} listeners. ` +
        `Possible memory leak detected.`
      );
    }

    const entry = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
    };

    listeners.push(entry);
    listeners.sort((a, b) => b.priority - a.priority);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  once(event, callback, options = {}) {
    return this.on(event, callback, { ...options, once: true });
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;

    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const listeners = this.listeners.get(event);
    const filtered = listeners.filter((entry) => entry.callback !== callback);

    if (filtered.length === 0) {
      this.listeners.delete(event);
    } else {
      this.listeners.set(event, filtered);
    }
  }

  emit(event, ...args) {
    if (!this.listeners.has(event)) return false;

    const listeners = this.listeners.get(event);
    const toRemove = [];

    for (const entry of listeners) {
      try {
        entry.callback(...args);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }

      if (entry.once) {
        toRemove.push(entry);
      }
    }

    // Remove once listeners
    for (const entry of toRemove) {
      const idx = listeners.indexOf(entry);
      if (idx !== -1) listeners.splice(idx, 1);
    }

    return true;
  }

  listenerCount(event) {
    return this.listeners.has(event) ? this.listeners.get(event).length : 0;
  }

  eventNames() {
    return [...this.listeners.keys()];
  }

  removeAllListeners() {
    this.listeners.clear();
  }
}

// Example usage
const bus = new EventEmitter();

bus.on("user:login", (user) => {
  console.log(`User logged in: ${user.name}`);
});

bus.on("user:login", (user) => {
  console.log(`Sending welcome email to ${user.email}`);
}, { priority: -1 });

bus.once("app:ready", () => {
  console.log("Application initialized!");
});

export { EventEmitter };
export default EventEmitter;

// State Machine - Finite Automaton Implementation
// A declarative state machine for managing complex state transitions

class StateMachine {
  constructor(config) {
    this.states = config.states;
    this.currentState = config.initial;
    this.context = config.context || {};
    this.history = [];
    this.listeners = [];
  }

  get state() {
    return this.currentState;
  }

  get stateConfig() {
    return this.states[this.currentState];
  }

  canTransition(event) {
    const stateConfig = this.states[this.currentState];
    if (!stateConfig || !stateConfig.on) return false;
    return event in stateConfig.on;
  }

  send(event, payload = {}) {
    const stateConfig = this.states[this.currentState];

    if (!stateConfig || !stateConfig.on || !stateConfig.on[event]) {
      console.warn(
        `No transition for event "${event}" in state "${this.currentState}"`
      );
      return this;
    }

    const transition = stateConfig.on[event];
    const prevState = this.currentState;

    // Handle guard conditions
    if (transition.guard && !transition.guard(this.context, payload)) {
      console.warn(`Guard blocked transition: ${event}`);
      return this;
    }

    // Execute exit action
    if (stateConfig.onExit) {
      stateConfig.onExit(this.context);
    }

    // Determine target state
    const target = typeof transition === "string" ? transition : transition.target;
    this.currentState = target;

    // Execute transition action
    if (typeof transition === "object" && transition.action) {
      transition.action(this.context, payload);
    }

    // Execute entry action
    const newStateConfig = this.states[this.currentState];
    if (newStateConfig && newStateConfig.onEntry) {
      newStateConfig.onEntry(this.context);
    }

    // Record history
    this.history.push({
      from: prevState,
      to: this.currentState,
      event,
      timestamp: Date.now(),
    });

    // Notify listeners
    this.listeners.forEach((listener) =>
      listener({
        from: prevState,
        to: this.currentState,
        event,
        context: this.context,
      })
    );

    return this;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getHistory() {
    return [...this.history];
  }

  reset(initial) {
    this.currentState = initial || Object.keys(this.states)[0];
    this.history = [];
    return this;
  }
}

// Example: Traffic Light
const trafficLight = new StateMachine({
  initial: "red",
  context: { cycleCount: 0 },
  states: {
    red: {
      on: {
        NEXT: {
          target: "green",
          action: (ctx) => { ctx.cycleCount++; },
        },
      },
      onEntry: (ctx) => console.log(`Cycle #${ctx.cycleCount}: RED`),
    },
    green: {
      on: { NEXT: "yellow" },
      onEntry: () => console.log("GREEN - Go!"),
    },
    yellow: {
      on: { NEXT: "red" },
      onEntry: () => console.log("YELLOW - Caution!"),
    },
  },
});

export { StateMachine };
export default StateMachine;

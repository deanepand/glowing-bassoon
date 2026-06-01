// Hello World - Basic JavaScript Example
// A simple demonstration of JavaScript fundamentals

function greet(name) {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] Hello, ${name}! Welcome to EpanDGist.`;
}

function greetMultiple(names) {
  return names.map((name, index) => {
    const greeting = greet(name);
    return `${index + 1}. ${greeting}`;
  });
}

// Example usage
const users = ["Alice", "Bob", "Charlie", "Diana"];
const greetings = greetMultiple(users);

greetings.forEach((msg) => console.log(msg));

// Export for module usage
export { greet, greetMultiple };

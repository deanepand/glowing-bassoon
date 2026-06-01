// Promise Handler - Async Control Flow Utilities
// Tools for managing complex asynchronous operations

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retry(fn, options = {}) {
  const { attempts = 3, delayMs = 1000, backoff = 2, onRetry } = options;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt === attempts) throw error;

      const waitTime = delayMs * Math.pow(backoff, attempt - 1);
      if (onRetry) onRetry(error, attempt, waitTime);
      await delay(waitTime);
    }
  }
}

async function parallel(tasks, concurrency = 5) {
  const results = [];
  const executing = new Set();

  for (const [index, task] of tasks.entries()) {
    const promise = Promise.resolve().then(() => task()).then((result) => {
      executing.delete(promise);
      results[index] = { status: "fulfilled", value: result };
    }).catch((error) => {
      executing.delete(promise);
      results[index] = { status: "rejected", reason: error };
    });

    executing.add(promise);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

async function timeout(promise, ms, message = "Operation timed out") {
  const timer = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timer]);
}

function debounceAsync(fn, wait) {
  let timeoutId;
  let pendingReject;

  return function (...args) {
    return new Promise((resolve, reject) => {
      if (pendingReject) pendingReject(new Error("Debounced"));
      clearTimeout(timeoutId);
      pendingReject = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, wait);
    });
  };
}

async function waterfall(tasks, initialValue) {
  let result = initialValue;
  for (const task of tasks) {
    result = await task(result);
  }
  return result;
}

// Example usage
async function main() {
  console.log("Starting async operations...");

  const results = await parallel(
    Array.from({ length: 10 }, (_, i) => async () => {
      await delay(Math.random() * 1000);
      return `Task ${i + 1} completed`;
    }),
    3
  );

  console.log("Results:", results);
}

export { delay, retry, parallel, timeout, debounceAsync, waterfall };
export default { delay, retry, parallel, timeout, debounceAsync, waterfall };

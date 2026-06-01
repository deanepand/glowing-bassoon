// Array Utilities - Functional Programming Helpers
// A collection of useful array manipulation functions

function chunk(array, size) {
  if (size <= 0) throw new Error("Chunk size must be positive");
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function unique(array, keyFn = (item) => item) {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function groupBy(array, keyFn) {
  return array.reduce((groups, item) => {
    const key = typeof keyFn === "function" ? keyFn(item) : item[keyFn];
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

function flatten(array, depth = Infinity) {
  if (depth <= 0) return [...array];
  return array.reduce((flat, item) => {
    if (Array.isArray(item) && depth > 0) {
      flat.push(...flatten(item, depth - 1));
    } else {
      flat.push(item);
    }
    return flat;
  }, []);
}

function partition(array, predicate) {
  const truthy = [];
  const falsy = [];
  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  return [truthy, falsy];
}

function intersection(arr1, arr2) {
  const set = new Set(arr2);
  return arr1.filter((item) => set.has(item));
}

function difference(arr1, arr2) {
  const set = new Set(arr2);
  return arr1.filter((item) => !set.has(item));
}

// Example usage
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log("Chunks:", chunk(data, 3));
console.log("Shuffled:", shuffle(data));
console.log("Partitioned:", partition(data, (n) => n % 2 === 0));

export { chunk, shuffle, unique, groupBy, flatten, partition, intersection, difference };

// To filter by tag, we can add some methods and data -- either export a class, or make this a singleton.
// Methods should include ways to do the following:
// - List debug tags that have been issued
// - Enable/disable particular tags
// - Maybe support an expression like the npmjs `debug` library does.

// For now, just make this a singleton.
const debugTags = new Set();

function debug(tag) {
  return (...args) => {
    debugTags.add(tag);
    args[0] = `[${tag}] ${args[0]}`;
    console.log(...args);
  };
};

function listDebugTags() {
  return Array.from(debugTags);
};


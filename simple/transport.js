
// Transport layer needs to provide addressability, routing, send, receive
// This will need to be implemented
// It's separated here because this is a portion of the system that would change depending on specific application
// contexts.
class TransportLayer {
  constructor() {
    this.listeners = new Map();
  }
  listen(address, callback) {
    if (this.listeners.has(address)) {
      throw new Error('max 1 listener per address');
    }
    this.listeners.set(address, callback);
  }
  // callback return value will be used as reply
  send(address, msg, callback) {
    const listener = this.listeners.get(address);
    if (!listener) {
      throw new Error(`destination address ${address} not found`);
    }
    const response = listener(msg);
    if (response !== undefined) {
      callback(response);
    }
  }
  list() {
    return Array.from(this.listeners.keys());
  }
}



// Transport layer needs to provide addressability, routing, send, receive
// This will need to be implemented
// It's separated here because this is a portion of the system that would change depending on specific application
// contexts.
class TransportLayer {
  constructor() {
    this.listeners = new Map();
  }
  bind(entity, address, callback) {
    // Return a handle we can use to send
    if (this.listeners.has(address)) {
      throw new Error('max 1 listener per address');
    }
    this.listeners.set(address, callback.bind(entity));
    return {
      send: (dstAddress, msg, callback) => {
        // callback return value will be used as reply
        const listener = this.listeners.get(dstAddress);
        if (!listener) {
          throw new Error(`destination address ${dstAddress} not found`);
        }
        // Before sending, set the header on the outbound message.
        msg.header = {
          src: address,
          dst: dstAddress,
        };
        // We simulate sending a message by just performing a direct call.
        // `this` binds to the caller by default.
        // To fix this we can explicitly bind it to the listening entity.
        const data = listener(msg);
        if (data !== undefined) {
          const reply = {
            header: {
              src: msg.header.dst,
              dst: msg.header.src,
            },
            data
          };
          callback(reply);
        }
      }
    }
  }
  list() {
    return Array.from(this.listeners.keys());
  }
}


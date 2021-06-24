class UIEntity extends UIElement {
  constructor(div, address) {
    super(div);

    this.setAddress(address);
    this.setId(createUUID());

    // Add address to the top of our header
    this.debug('label')(`before change: ${this.getLabel()}`);
    this.setLabel(`(${this.getAddress()}) ${this.getLabel()}`);
    this.debug('label')(`after change: ${this.getLabel()}`);
  }

  setId(id) { this.id = id; }
  getId() { return this.id; }

  setRxTx(rxtx) { this.rxtx = rxtx; }
  getRxTx() { return this.rxtx; }

  setTransport(transport) { this.transport = transport; }
  getTransport() { return this.transport; }

  getAddress() { return this.address };
  setAddress(address) {
    if (this.getAddress()) {
      throw new Error('address already set; changing addresses not currently ' +
        'supported');
    }
    this.address = address;
  }

  findAllOthers() {
    return this.getTransport().list().filter(x => x !== this.address);
  }

  avoidAllOthers(targetSide) {
    // Move to avoid covering any other entity.
    if (!targetSide) {
      targetSide = Math.random() > 0.5 ? 'left' : 'right';
    }
    const coveredAreas = {};
    this.findAllOthers().forEach(address => {
      const msg = {
        queries: [
          {var: 'bounds'},
          {var: 'offset'},
        ],
      };
      this.getRxTx().send(address, msg, response => {
        // this.debug(`response`, response);
        const [bounds, offset] = response.data
        const {left, top, width, height} = bounds;
        coveredAreas[address] = ({left, top, width, height});
      });
    });
    // Because of how we've implemented this, it's currently synchronous;
    // Really we'll need an `await` here.

    // Ok now we know where everyone else is.
    // First let's check whether we are overlapping with anyone.
    // That means, is anyone's corner in our space, or are any of our corners in
    // their space?

    const overlappingAnyOthers = () => {
      const result = Object.values(coveredAreas).some(coveredArea => {
        return rectanglesIntersect(coveredArea, this.getBoundingRectangle());
      });
      return result;
    };

    const getRightmost = () =>
      Object.values(coveredAreas).reduce((max, cur) => {
        const val = cur.left + cur.width;
        return Math.max(val, max);
      }, 0);

    const getLeftmost = () =>
      Object.values(coveredAreas).reduce((min, cur) => {
        const val = cur.left;
        if (min === null) {
          return val;
        }
        return Math.min(val, min);
      }, null);

    let i = 0;
    while (overlappingAnyOthers()) {
      if (++i > 1) {
        throw new Error(`avoidAllOthers seems to be stuck in a loop, i = ${i}`);
      }
      switch (targetSide) {
        case 'right':
        {
          // this.debug('positioning')(`moving to the rightmost side`);
          // If there is extra space on the left, request all other entities
          // move left.
          const spaceAvailableLeft = getLeftmost();
          if (spaceAvailableLeft > 0) {
            this.debug('positioning')(`space available on left side; ` +
              `requesting all others to shift`);
            this.requestAllOthersToShift(-spaceAvailableLeft, 0, response => {
              const address = response.header.src;
              const {left, top, width, height} = response.data;
              coveredAreas[address] = ({left, top, width, height});
            });
            // Would properly need to await here
          }
          this.moveTo(getRightmost() + 1, null);
          continue;
        }
        case 'left':
        {
          // this.debug('positioning')(`moving to the leftmost side`);
          // If there's room, move to the left.
          // Then request all other entities to move to the right.
          const spaceAvailableLeft = this.getBoundingRectangle().left;
          if (spaceAvailableLeft > 0) {
            this.moveTo(0, null);
          }
          const spaceAvailableRight = getLeftmost() - this.getBoundingRectangle().left -
            this.getBoundingRectangle().width;
          this.requestAllOthersToShift(-spaceAvailableRight + 1, 0,
            response => {
              const address = response.header.src;
              const {left, top, width, height} = response.data;
              coveredAreas[address] = ({left, top, width, height});
            });
          continue;
        }
      }
    }

    // What could also be nice is to generate a map of uncovered spaces.
    // Then we could just pick a space from that list.

    // When we get to the point where we have filled up the available space
    // we'll need to do something. Maybe we minimize overlap instead of
    // disallowing it completely. Maybe we shake things around to try to
    // consolidate smaller empty spaces into larger ones.

    // It could be useful to be able to expand in any direction. For example
    // move everything to the right to create more space on the left.
    // [Implemented as requestOtherToShift() and requestAllOthersToShift().]

    // Another strategy we can try is we can do the following:
    // - decide where we want to be
    // - come up with proposed modifications to the positions of other entities
    // - request the other entities to move in the proposed ways
    // - occupy our new position

    // We can combine these approaches
    // Does this need to be recursive?
    // If so, can we provide any bounds for the stack depth? And/or do we have
    // tail-call optimization?

    // Let's try a multi-pass approach.
    // First, look for nearby holes. We can do this via binary search along some
    // vectors. Maybe keep going until we find at least one hole; Maybe keep
    // going longer (part of a separate routine probably) as a means of mapping
    // out the space, e.g. in preparation for trying to place multiple entities.
    // Once we do or do not find any nearby holes, next test a plan where we ask
    // everyone to move directly away from us. If we ask everyone to move along
    // a particular vector, it's the same operation as moving ourselves combined
    // with effectively shifting the position of the origin. If we however ask
    // everyone to move along distinct vectors, this is potentially a very
    // different kind of operation. It can be designed according to any mapping
    // we desire. The other entities won't necessarily know

  }

  requestOtherToShift(address, right, down, callback) {
    const msg = {
      request: {
        shift: {right, down}
      },
      queries: [
        {
          var: 'bounds'
        },
        {
          var: 'offset'
        },
      ],
    };
    this.getRxTx().send(address, msg, response => {
      callback(response);
    });
  }

  requestAllOthersToShift(right, down, callback) {
    this.findAllOthers().forEach(address => {
      this.requestOtherToShift(address, right, down, callback);
    });
  }

  message(msg) {
    if (msg.header.dst !== this.getAddress()) {
      throw new Error(`${this.getAddress()} received message destined for ` +
        `${msg.header.dst}`);
    }
    // See if we can infer considerations from this message,
    // using what other context we have available, such as
    // from other messages, or other asynchronous processes.
    // If so, then do our best to learn the implied considerations.

    // How shall we go about this?
    // Let's start simple. We'll define a message schema to let people
    // tell us their considerations.
    // It can be in this form:
    // I care about the result of evaluating the following expression:
    //   < Expression that references any available operations we support >
    // We do the following:
    //   - Reference immediately available memory
    //   - Perform any necessary actions based on knowledge available at this
    //     time
    //   - Acknowledge receipt of request
    //   - Perform any further actions on behalf of this message
    //   - Perform any further actions on behalf of other considerations
    //   - Await further messages
    //   - Await other asynchronous events (or treat everything as a message)
    //   - Perform any further actions on behalf of these messages or other
    //     considerations

    if (msg.considerations) {
      Object.keys(msg.considerations).forEach(id => {
        if (!this.stores.fastmem.has('considerations', id)) {
          // First time we've seen this recently.
          // It's possible we have more information available if we make some
          // queries.
          // We probably want to form a rank estimate, and form a plan of action.
          // It's possible that we could revise the plan in the future, and/or
          // that the plan encodes some complexity regarding how it will respond
          // to future conditions. Anyway, just go ahead and store it.
          this.stores.fastmem.set('considerations', id, msg.considerations[id]);
        }
        const c = this.stores.fastmem.get('considerations', id);
        this.debug('considerations')('consideration:', c);
      });
    }

    if (msg.request) {
      if (msg.request.shift) {
        const {left, top} = this.getRectangle();
        const {shift} = msg.request;
        // this.debug('positioning')(`received shift request. ${JSON.stringify({left, top, shift})}`);
        this.moveTo(left + shift.right, top + shift.down);
      }
    }

    if (msg.query && msg.queries) {
      throw new Error('may only include one of `query` or `queries` in message');
    }

    if (msg.query || msg.queries) {
      const context = {
        offset: this.getRectangle(),
        bounds: this.getBoundingRectangle(),
      };
      const handleQuery = query => {
        // Let's use jsonLogic to evaluate queries.
        // We'll explicitly expose here whatever content we want to make available.
        const result = jsonLogic.apply(query, context);
        // this.debug('query')(`from ${msg.header.src} ${JSON.stringify({query, result})}`);
        return result;
      };
      if (msg.query) {
        return handleQuery(msg.query);
      }
      if (msg.queries) {
        return msg.queries.map(query => handleQuery(query));
      }
    }

    // If we haven't already replied, return true here as an ack
    return true;
  }
}


// A Mesh of UIElements
class UIMesh {
  constructor(div) {
    this.setDiv(div);

    this.entities = new Map();
    // Initialize some values automatically?
    // Maybe only if we get an expression as an argument

    // Initialize transport layer
    const transport = new TransportLayer();
    this.setTransport(transport);
  }

  getDiv() { return this.div; }
  setDiv(div) { this.div = div; }

  getTransport() { return this.transport; }
  setTransport(transport) { this.transport = transport; }

  // Each constituent UIEntity will have its own uuid
  // We'll provide a Transport implementation for the UIEntities
  // that suits our purposes as it puts the right kind of control in our hands.
  addEntity(entity) {
    // Might as well let `entity` be any sort of partial or generic entity?
    // We don't have to care necessarily; so let's only care about things we're
    // specifically asked to // we can offer them as optional services?

    // Add the entity to map by id
    this.entities.set(entity.getId(), entity);

    // Register the address with transport layer
    const address = entity.getAddress();
    entity.debug('transport', `binding to address ${address}`);
    const rxtx = this.getTransport().bind(entity, address, msg => {
      // Dispatch message to appropriate handler
      return entity.message(msg);
    });
    entity.setRxTx(rxtx);
    entity.setTransport(this.getTransport());

    // As a side-effect, copy this to our label
    entity.setLabel(`#${address}`);

    // Display the entity
    this.getDiv().append(entity.getDiv());

    // TODO: resize main display div?

    return entity;
  }
}

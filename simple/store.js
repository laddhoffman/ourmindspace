// For convenience we auto-initialize collections,
// but we do not auto-initialize records within those collections.
class Store extends Map {
  get(collection, key) {
    this.assertCollection(collection);
    return super.get(collection).get(key);
  }
  set(collection, key, value) {
    this.assertCollection(collection);
    return super.get(collection).set(key, value);
  }
  has(collection, key) {
    this.assertCollection(collection);
    return super.get(collection).has(key);
  }
  assertCollection(collection) {
    if (!super.has(collection)) {
      super.set(collection, new Collection());
    }
  }
  listCollections() {
    return Array.from(this.keys());
  }
}


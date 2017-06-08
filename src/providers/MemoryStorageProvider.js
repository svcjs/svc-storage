class MemoryStorageProvider {
  constructor () {
    this.data = {}
  }

  getItem (key) {
    return this.data[key]
  }

  setItem (key, value) {
    this.data[key] = value
  }

  removeItem (key) {
    delete this.data[key]
  }
}

module.exports = MemoryStorageProvider

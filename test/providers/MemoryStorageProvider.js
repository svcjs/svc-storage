export default class MemoryStorageProvider {
  constructor () {
    this.data = {}
  }

  get (key) {
    return new Promise((resolve, reject) => {
      resolve(this.data[key])
    })
  }

  set (key, value) {
    return new Promise((resolve, reject) => {
      this.data[key] = value
      resolve()
    })
  }

  remove (key) {
    return new Promise((resolve, reject) => {
      delete this.data[key]
      resolve()
    })
  }
}

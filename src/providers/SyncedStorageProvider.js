export default class SyncedStorageProvider {
  constructor (callObject, getMethod, setMethod, removeMethod) {
    this.callObject = callObject
    this.getMethod = getMethod !== undefined ? getMethod : 'get'
    this.setMethod = setMethod !== undefined ? setMethod : 'set'
    this.removeMethod = removeMethod !== undefined ? removeMethod : 'remove'
  }

  get (key) {
    return new Promise((resolve, reject) => {
      resolve(this.callObject[this.getMethod](key))
    })
  }

  set (key, value) {
    return new Promise((resolve, reject) => {
      this.callObject[this.setMethod](key, value)
      resolve()
    })
  }

  remove (key) {
    return new Promise((resolve, reject) => {
      this.callObject[this.removeMethod](key)
      resolve()
    })
  }
}

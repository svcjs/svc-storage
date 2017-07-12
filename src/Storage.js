export default class Storage {
  constructor () {
    this._provider = null
    this._prefix = ''
  }

  setPrefix (prefix) {
    this._prefix = prefix
  }

  setProvider (provider) {
    this._provider = provider
  }

  get (keyOrKeys) {
    if (keyOrKeys instanceof Array) {
      let promises = []
      for (let key of keyOrKeys) {
        let promise = this._provider.get(this._prefix + key)
        if (promise instanceof Promise) {
          promises.push(promise)
        }
      }
      return new Promise((resolve, reject) => {
        Promise.all(promises).then((results) => {
          let data = {}
          for (let i = 0; i < results.length; i++) {
            data[keyOrKeys[i]] = results[i] ? JSON.parse(results[i]) : results[i]
          }
          resolve(data)
        }).catch(reject)
      })
    } else {
      let promise = this._provider.get(this._prefix + keyOrKeys)
      return new Promise((resolve, reject) => {
        if (promise instanceof Promise) {
          promise.then((result) => {
            resolve(result ? JSON.parse(result) : result)
          }).catch(reject)
        } else {
          reject(new Error('[Storage Provider] get is not a Promise'))
        }
      })
    }
  }

  set (keyOrValues, value) {
    if (typeof keyOrValues === 'object') {
      let promises = []
      for (let key in keyOrValues) {
        let promise = this._provider.set(this._prefix + key, JSON.stringify(keyOrValues[key]))
        if (promise instanceof Promise) {
          promises.push(promise)
        }
      }
      return Promise.all(promises)
    } else {
      let promise = this._provider.set(this._prefix + keyOrValues, JSON.stringify(value))
      return promise instanceof Promise ? promise : new Promise((resolve, reject) => {
        reject(new Error('[Storage Provider] set is not a Promise'))
      })
    }
  }

  remove (keyOrKeys) {
    if (keyOrKeys instanceof Array) {
      let promises = []
      for (let key of keyOrKeys) {
        let promise = this._provider.remove(this._prefix + key)
        if (promise instanceof Promise) {
          promises.push(promise)
        }
      }
      return Promise.all(promises)
    } else {
      let promise = this._provider.remove(this._prefix + keyOrKeys)
      return promise instanceof Promise ? promise : new Promise((resolve, reject) => {
        reject(new Error('[Storage Provider] remove is not a Promise'))
      })
    }
  }
}

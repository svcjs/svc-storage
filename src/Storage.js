// a storage from memory
class _MemoryStorage {
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

class Storage {
  constructor () {
    this._provider = null
    this._prefix = ''
    this._isAsync = false
  }

  _makePromise (method, args) {
    if (!this._provider) {
      this._provider = new _MemoryStorage()
    }
    if (typeof args[0] !== 'object') {
      args[0] = this._prefix + args[0]
    } else if (this._isAsync) {
      method = (method === 'removeItem' ? 'multiRemove' : (method === 'setItem' ? 'multiSet' : 'multiGet'))
    }
    let that = this
    return new Promise(function (resolve, reject) {
      let k
      if (!that._provider[method]) return reject(new Error('Storage Provider method ' + method + ' is not exists'))
      if (that._isAsync) {
        if (method === 'setItem') {
          args[1] = JSON.stringify(args[1])
        } else if (method === 'multiSet') {
          let data = {}
          for (k in args[0]) {
            data[that._prefix + k] = JSON.stringify(args[0][k])
          }
          args = [data]
        } else if (method === 'multiGet' || method === 'multiRemove') {
          let newKeys = []
          for (let i in args[0]) {
            newKeys[i] = that._prefix + args[0][i]
          }
          args[0] = newKeys
        }

        args.push(function (err, result) {
          if (err) {
            result = {}
            if (method === 'getItem') {
              result = undefined
            }
            resolve(result)
          } else {
            if (method === 'getItem' && result) {
              result = JSON.parse(result)
            } else if (method === 'multiGet') {
              let data = {}
              for (k in result) {
                if (result[k]) result[k] = JSON.parse(result[k])
                data[k.substr(that._prefix.length)] = result[k]
              }
              result = data
            }
            resolve(result)
          }
        })
        that._provider[method].apply(that._provider, args)
      } else {
        if (typeof args[0] === 'string') {
          if (method === 'setItem') {
            args[1] = JSON.stringify(args[1])
          }
          let result
          result = that._provider[method].apply(that._provider, args)
          resolve(method === 'getItem' && result ? JSON.parse(result) : result)
        } else {
          let results
          if (method === 'getItem') {
            results = {}
            for (k in args[0]) {
              results[args[0][k]] = that._provider[method](that._prefix + args[0][k])
              if (results[args[0][k]]) results[args[0][k]] = JSON.parse(results[args[0][k]])
            }
            resolve(results)
          } else {
            results = true
            for (k in args[0]) {
              results = that._provider[method].apply(that._provider, method === 'setItem' ? [that._prefix + k, args[0][k]] : [that._prefix + args[0][k]])
            }
            resolve(results)
          }
        }
      }
    })
  }

  setPrefix (prefix) {
    this._prefix = prefix
  }

  setProvider (provider, isAsync) {
    if (this._provider) {
      console.error('Storage Provider can\'t set repeated')
      return
    }
    this._isAsync = !!isAsync
    this._provider = provider
  }

  load (keyOrKeys) {
    return this._makePromise('getItem', [keyOrKeys])
  }

  save (keyOrValues, value) {
    return this._makePromise('setItem', [keyOrValues, value])
  }

  remove (keyOrKeys) {
    return this._makePromise('removeItem', [keyOrKeys])
  }
}

module.exports = Storage

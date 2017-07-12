let fs = require('fs')

export default class FileStorageProvider {
  constructor (path) {
    if (!fs.existsSync(path)) fs.mkdirSync(path)

    if (path.charAt(path.length - 1) !== '/') path += '/'
    this._path = path
  }

  get (key) {
    return new Promise((resolve, reject) => {
      fs.readFile(this._path + key, function (err, result) {
        if (err) {
          resolve(undefined)
        } else {
          resolve(result.toString())
        }
      })
    })
  }

  set (key, value) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this._path + key, value, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  remove (key) {
    return new Promise((resolve, reject) => {
      fs.unlink(this._path + key, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}

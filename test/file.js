import test from 'ava'
import Storage from '../'
import fs from 'fs'

test('simple', async t => {
  let s = new Storage()
  s.setProvider(new FileStorageProvider('/tmp/test_file_storage1'), true)
  await s.save('aaa', [111, '222', {cc: 33, dd: false}])
  let data = await s.load('aaa')
  t.true(data[0] === 111 && data[2].dd === false)
  await s.remove('aaa')
  data = await s.load('aaa')
  t.true(data === undefined)
  fs.rmdirSync('/tmp/test_file_storage1')
})

test('multi', async t => {
  let s = new Storage()
  s.setProvider(new FileStorageProvider('/tmp/test_file_storage2'), true)
  await s.save({bbb: false, ccc: 123, ddd: 'xxx'})
  let data = await s.load(['aaa', 'bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === 123)
  await s.remove(['ccc', 'ddd'])
  data = await s.load(['bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === undefined)
  let bbb = fs.readFileSync('/tmp/test_file_storage2/bbb').toString()
  t.true(bbb === 'false')
  fs.unlinkSync('/tmp/test_file_storage2/bbb')
  fs.rmdirSync('/tmp/test_file_storage2')
})

test('prefix', async t => {
  let s = new Storage()
  s.setProvider(new FileStorageProvider('/tmp/test_file_storage3'), true)
  s.setProvider(new FileStorageProvider('/tmp/test_file_storage4'), true)
  s.setPrefix('yee_')
  await s.save({bbb: false, ccc: 123, ddd: 'xxx'})
  let data = await s.load(['aaa', 'bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === 123)
  await s.remove(['ccc', 'ddd'])
  data = await s.load(['bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === undefined)
  let bbb = fs.readFileSync('/tmp/test_file_storage3/yee_bbb').toString()
  t.true(bbb === 'false')
  fs.unlinkSync('/tmp/test_file_storage3/yee_bbb')
  fs.rmdirSync('/tmp/test_file_storage3')
  fs.rmdirSync('/tmp/test_file_storage4')
})

function FileStorageProvider (path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path)

  if (path.charAt(path.length - 1) !== '/') path += '/'
  this._path = path

  this.getItem = function (key, cb) {
    fs.readFile(this._path + key, function (err, result) {
      if (err) {
        cb(err, undefined)
      } else {
        cb(null, result.toString())
      }
    })
  }
  this.setItem = function (key, value, cb) {
    fs.writeFile(this._path + key, value, cb)
  }
  this.removeItem = function (key, cb) {
    fs.unlink(this._path + key, cb)
  }
  this.multiGet = function (keys, cb) {
    var results = {}
    for (var i in keys) {
      try {
        results[keys[i]] = fs.readFileSync(this._path + keys[i]).toString()
      } catch (err) {
        results[keys[i]] = undefined
      }
    }
    cb(null, results)
  }
  this.multiSet = function (data, cb) {
    for (var k in data) {
      fs.writeFileSync(this._path + k, data[k])
    }
    cb(null, undefined)
  }
  this.multiRemove = function (keys, cb) {
    for (var i in keys) {
      try {
        fs.unlinkSync(this._path + keys[i])
      } catch (err) {
      }
    }
    cb(null, undefined)
  }
}

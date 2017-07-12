import test from 'ava'
import { Storage, SyncedStorageProvider } from '../src/index'
import FileStorageProvider from './providers/FileStorageProvider'
import fs from 'fs'

async function testSimple (t, path, provider) {
  let s = new Storage()
  s.setProvider(provider)
  await s.set('aaa', [111, '222', {cc: 33, dd: false}])
  let data = await s.get('aaa')
  t.true(data[0] === 111 && data[2].dd === false)
  await s.remove('aaa')
  data = await s.get('aaa')
  t.true(data === undefined)
  fs.rmdirSync(path)
}

async function testMulti (t, path, provider) {
  let s = new Storage()
  s.setProvider(provider)
  await s.set({bbb: false, ccc: 123, ddd: 'xxx'})
  let data = await s.get(['aaa', 'bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === 123)
  await s.remove(['ccc', 'ddd'])
  data = await s.get(['bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === undefined)
  let bbb = fs.readFileSync(path + '/bbb').toString()
  t.true(bbb === 'false')
  fs.unlinkSync(path + '/bbb')
  fs.rmdirSync(path)
}

async function testPrefix (t, path1, path2, provider1, provider2) {
  let s = new Storage()
  s.setProvider(provider1)
  s.setProvider(provider2)
  s.setPrefix('yee_')
  await s.set({bbb: false, ccc: 123, ddd: 'xxx'})
  let data = await s.get(['aaa', 'bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === 123)
  await s.remove(['ccc', 'ddd'])
  data = await s.get(['bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === undefined)
  let bbb = fs.readFileSync(path2 + '/yee_bbb').toString()
  t.true(bbb === 'false')
  fs.unlinkSync(path2 + '/yee_bbb')
  fs.rmdirSync(path2)
  fs.rmdirSync(path1)
}

function makeSyncedFileProvider (path) {
  if (!fs.existsSync(path)) fs.mkdirSync(path)
  if (path.charAt(path.length - 1) !== '/') path += '/'
  return new SyncedStorageProvider({
    read: function (key) {
      try {
        return fs.readFileSync(path + key)
      } catch (err) {
        return undefined
      }
    },
    write: function (key, value) {
      fs.writeFileSync(path + key, value)
    },
    delete: function (key) {
      fs.unlinkSync(path + key)
    }
  }, 'read', 'write', 'delete')
}

test('simple', t => {
  return testSimple(t, '/tmp/test_file_storage1', new FileStorageProvider('/tmp/test_file_storage1'))
})

test('multi', async t => {
  return testMulti(t, '/tmp/test_file_storage2', new FileStorageProvider('/tmp/test_file_storage2'))
})

test('prefix', async t => {
  return testPrefix(t, '/tmp/test_file_storage3', '/tmp/test_file_storage4', new FileStorageProvider('/tmp/test_file_storage3'), new FileStorageProvider('/tmp/test_file_storage4'))
})

test('simple', t => {
  return testSimple(t, '/tmp/test_synced_file_storage1', makeSyncedFileProvider('/tmp/test_synced_file_storage1'))
})

test('multi', async t => {
  return testMulti(t, '/tmp/test_synced_file_storage2', makeSyncedFileProvider('/tmp/test_synced_file_storage2'))
})

test('prefix', async t => {
  return testPrefix(t, '/tmp/test_synced_file_storage3', '/tmp/test_synced_file_storage4', makeSyncedFileProvider('/tmp/test_synced_file_storage3'), makeSyncedFileProvider('/tmp/test_synced_file_storage4'))
})

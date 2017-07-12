import test from 'ava'
import { Storage, SyncedStorageProvider } from '../src/index'
import MemoryStorageProvider from './providers/MemoryStorageProvider'

async function testSimple (t, provider) {
  let s = new Storage()
  s.setProvider(provider)
  await s.set('aaa', [111, '222', {cc: 33, dd: false}])
  let data = await s.get('aaa')
  t.true(data[0] === 111 && data[2].dd === false)
  await s.remove('aaa')
  data = await s.get('aaa')
  t.true(data === undefined)
}

async function testMulti (t, provider) {
  let s = new Storage()
  s.setProvider(provider)
  await s.set({bbb: false, ccc: 123, ddd: 'xxx'})
  let data = await s.get(['aaa', 'bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === 123)
  await s.remove(['ccc', 'ddd'])
  data = await s.get(['bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === undefined)
}

async function testPrefix (t, provider) {
  let s = new Storage()
  s.setProvider(provider)
  s.setPrefix('yee_')
  await s.set({bbb: false, ccc: 123, ddd: 'xxx'})
  let data = await s.get(['aaa', 'bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === 123)
  await s.remove(['ccc', 'ddd'])
  data = await s.get(['bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === undefined)
}

function makeSyncedMemoryProvider () {
  return {
    data: {},
    get: function (key) {
      return this.data[key]
    },
    set: function (key, value) {
      this.data[key] = value
    },
    remove: function (key) {
      delete this.data[key]
    }
  }
}

test('simple', t => {
  return testSimple(t, new MemoryStorageProvider())
})

test('multi', async t => {
  return testMulti(t, new MemoryStorageProvider())
})

test('prefix', async t => {
  return testPrefix(t, new MemoryStorageProvider())
})

test('simple', t => {
  return testSimple(t, new SyncedStorageProvider(makeSyncedMemoryProvider()))
})

test('multi', async t => {
  return testMulti(t, new SyncedStorageProvider(makeSyncedMemoryProvider()))
})

test('prefix', async t => {
  return testPrefix(t, new SyncedStorageProvider(makeSyncedMemoryProvider()))
})

test('not promise', async t => {
  let s = new Storage()
  s.setProvider(makeSyncedMemoryProvider())

  try {
    await s.set('aaa', [111, '222', {cc: 33, dd: false}])
    t.true(false)
  } catch (err) {
    t.true(err.message === '[Storage Provider] set is not a Promise')
  }

  try {
    await s.get('aaa')
    t.true(false)
  } catch (err) {
    t.true(err.message === '[Storage Provider] get is not a Promise')
  }

  try {
    await s.remove('aaa')
    t.true(false)
  } catch (err) {
    t.true(err.message === '[Storage Provider] remove is not a Promise')
  }
})

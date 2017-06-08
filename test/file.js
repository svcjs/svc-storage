import test from 'ava'
import { Storage } from '../'
import FileStorageProvider from '../src/providers/FileStorageProvider'
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

import test from 'ava'
import Storage from '../'

test('simple', async t => {
  let s = new Storage()
  await s.save('aaa', [111, '222', {cc: 33, dd: false}])
  let data = await s.load('aaa')
  t.true(data[0] === 111 && data[2].dd === false)
  await s.remove('aaa')
  data = await s.load('aaa')
  t.true(data === undefined)
})

test('multi', async t => {
  let s = new Storage()
  await s.save({bbb: false, ccc: 123, ddd: 'xxx'})
  let data = await s.load(['aaa', 'bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === 123)
  await s.remove(['ccc', 'ddd'])
  data = await s.load(['bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === undefined)
  t.true(s._provider.data.bbb === false)
})

test('prefix', async t => {
  let s = new Storage()
  s.setPrefix('yee_')
  await s.save({bbb: false, ccc: 123, ddd: 'xxx'})
  let data = await s.load(['aaa', 'bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === 123)
  await s.remove(['ccc', 'ddd'])
  data = await s.load(['bbb', 'ccc'])
  t.true(data.bbb === false && data.ccc === undefined)
  t.true(s._provider.data.yee_bbb === false)
})

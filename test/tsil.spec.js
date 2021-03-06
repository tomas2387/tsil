const test = require('ava')
const { clone, isEqual, isNumber } = require('lodash')

const tsil = require('../lib/index')
const treeTest = require('./tree')

test('flatten and deflatten without changes outputs same object', (t) => {
  const list = tsil.flatten(treeTest)
  const rebuilt = tsil.deflatten(list)

  t.plan(1)
  t.true(isEqual(rebuilt, treeTest))
})

test('modify flatten list and deflatten keeping structure', (t) => {
  const list = tsil.flatten(treeTest).map((node) => {
    const value = node[tsil.VAL]
    return Object.assign({}, node, {
      [tsil.VAL]: Object.assign({}, value, { v: value.v * 10 })
    })
  })
  const rebuilt = tsil.deflatten(list)

  t.plan(2)
  t.true(rebuilt.b.v === treeTest.b.v * 10)
  t.true(rebuilt.c.c[1].c.c3.v === treeTest.c.c[1].c.c3.v * 10)
})

test('modify with .modify fn keeps original structure', (t) => {
  const list = tsil.modify(tsil.flatten(treeTest), (value) => {
    return Object.assign({}, value, { v: value.v * 10 })
  })
  const rebuilt = tsil.deflatten(list)

  t.plan(2)
  t.true(rebuilt.b.v === treeTest.b.v * 10)
  t.true(rebuilt.c.c[1].c.c3.v === treeTest.c.c[1].c.c3.v * 10)
})

test('modify with .merge fn keeps original structure', (t) => {
  const list = tsil.merge(tsil.flatten(treeTest), (value) => {
    return { v: value.v * 10 }
  })
  const rebuilt = tsil.deflatten(list)

  t.plan(2)
  t.true(rebuilt.b.v === treeTest.b.v * 10)
  t.true(rebuilt.c.c[1].c.c3.v === treeTest.c.c[1].c.c3.v * 10)
})

test('modify values does not change original object', (t) => {
  const controlTester = clone(treeTest)

  tsil.flatten(treeTest).map((x) => {
    return Object.assign({}, x, { extra: 1337 })
  })

  t.plan(1)
  t.true(isEqual(controlTester, treeTest))
})

test('work with primite types', (t) => {
  const stub = { a: 1, b: { c: 3 }, d: 'string', e: true }
  const result = tsil.deflatten(tsil.flatten(stub))
  const withChanges = tsil.deflatten(
    tsil.flatten(stub).map((node) => Object.assign({}, node, {
      [tsil.VAL]:
        isNumber(node[tsil.VAL])
          ? node[tsil.VAL] * 2
          : node[tsil.VAL]
    }))
  )

  t.plan(5)
  t.true(isEqual(result, stub))
  t.true(isEqual(stub.a * 2, withChanges.a))
  t.true(isEqual(stub.b.c, withChanges.b.c))
  t.true(isEqual(stub.d, withChanges.d))
  t.true(isEqual(stub.e, withChanges.e))
})

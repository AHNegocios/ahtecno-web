import assert from 'node:assert/strict'
import test from 'node:test'
import { saveProduct } from './product.js'

const terminalQuery = (result) => ({
  select: () => ({
    single: async () => result,
  }),
})

test('inserta un producto nuevo sin usar upsert', async () => {
  const calls = []
  const supabase = {
    from: (table) => {
      assert.equal(table, 'Productos')
      return {
        insert: (payload) => {
          calls.push({ operation: 'insert', payload })
          return terminalQuery({ data: { id: 10, ...payload }, error: null })
        },
        update: () => assert.fail('No debe actualizar un producto nuevo'),
      }
    },
  }

  const saved = await saveProduct(supabase, null, {
    ml_id: 'MLA47264969',
    precio: 19998.99,
  })

  assert.equal(calls[0].operation, 'insert')
  assert.equal(saved.id, 10)
})

test('actualiza por id cuando el producto ya existe', async () => {
  const calls = []
  const supabase = {
    from: () => ({
      insert: () => assert.fail('No debe insertar un producto existente'),
      update: (payload) => ({
        eq: (column, value) => {
          calls.push({ operation: 'update', payload, column, value })
          return terminalQuery({ data: { id: value, ...payload }, error: null })
        },
      }),
    }),
  }

  const saved = await saveProduct(
    supabase,
    { id: 25 },
    { ml_id: 'MLA47264969', precio: 21000 },
  )

  assert.deepEqual(
    { operation: calls[0].operation, column: calls[0].column, value: calls[0].value },
    { operation: 'update', column: 'id', value: 25 },
  )
  assert.equal(saved.precio, 21000)
})

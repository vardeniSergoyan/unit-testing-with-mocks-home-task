const assert = require('assert')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

describe('UserDataHandler (proxyquire + sinon)', function () {
  let UserDataHandler, axiosStub, handler

  beforeEach(function () {
    axiosStub = {
      get: sinon.stub()
    }

    UserDataHandler = proxyquire('../src/data_handlers/user_data_handler', {
      axios: { default: { get: axiosStub.get } }
    })

    handler = new UserDataHandler()
  })

  afterEach(function () {
    sinon.restore()
  })

  describe('constructor', function () {
    it('should initialize users as an empty array', function () {
      assert.deepStrictEqual(handler.users, [])
    })
  })

  describe('loadUsers', function () {
    it('should populate users array when API call succeeds', async function () {
      const mockUsers = [
        { id: 1, name: 'Alice', email: 'alice@test.com' },
        { id: 2, name: 'Bob', email: 'bob@test.com' }
      ]
      axiosStub.get.resolves({ data: mockUsers })

      await handler.loadUsers()

      assert.deepStrictEqual(handler.users, mockUsers)
      assert(axiosStub.get.calledOnceWith('http://localhost:3000/users'))
    })

    it('should throw an error when API call fails', async function () {
      axiosStub.get.rejects(new Error('Network error'))

      await assert.rejects(
        () => handler.loadUsers(),
        (err) => {
          assert(err instanceof Error)
          assert(err.message.includes('Failed to load users data'))
          return true
        }
      )
    })
  })

  describe('getUserEmailsList', function () {
    it('should return emails separated by semicolons when users are loaded', function () {
      handler.users = [
        { id: 1, email: 'alice@test.com' },
        { id: 2, email: 'bob@test.com' },
        { id: 3, email: 'carol@test.com' }
      ]

      const result = handler.getUserEmailsList()

      assert.strictEqual(result, 'alice@test.com;bob@test.com;carol@test.com')
    })

    it('should return a single email when only one user is loaded', function () {
      handler.users = [{ id: 1, email: 'alice@test.com' }]

      const result = handler.getUserEmailsList()

      assert.strictEqual(result, 'alice@test.com')
    })

    it('should throw an error when no users are loaded', function () {
      assert.throws(
        () => handler.getUserEmailsList(),
        (err) => {
          assert(err instanceof Error)
          assert.strictEqual(err.message, 'No users loaded!')
          return true
        }
      )
    })
  })

  describe('getNumberOfUsers', function () {
    it('should return 0 when no users are loaded', function () {
      assert.strictEqual(handler.getNumberOfUsers(), 0)
    })

    it('should return the correct count when users are loaded', function () {
      handler.users = [{ id: 1 }, { id: 2 }, { id: 3 }]

      assert.strictEqual(handler.getNumberOfUsers(), 3)
    })
  })

  describe('isMatchingAllSearchParams', function () {
    const user = { id: 1, name: 'Alice', email: 'alice@test.com', city: 'NYC' }

    it('should return true when all search params match', function () {
      const result = handler.isMatchingAllSearchParams(user, { name: 'Alice', city: 'NYC' })
      assert.strictEqual(result, true)
    })

    it('should return false when a search param does not match', function () {
      const result = handler.isMatchingAllSearchParams(user, { name: 'Bob' })
      assert.strictEqual(result, false)
    })

    it('should return false and break early when first param does not match', function () {
      const result = handler.isMatchingAllSearchParams(user, { name: 'Bob', city: 'NYC' })
      assert.strictEqual(result, false)
    })

    it('should return true when search params object is empty', function () {
      const result = handler.isMatchingAllSearchParams(user, {})
      assert.strictEqual(result, true)
    })

    it('should return false when second param does not match', function () {
      const result = handler.isMatchingAllSearchParams(user, { name: 'Alice', city: 'LA' })
      assert.strictEqual(result, false)
    })
  })

  describe('findUsers', function () {
    beforeEach(function () {
      handler.users = [
        { id: 1, name: 'Alice', email: 'alice@test.com' },
        { id: 2, name: 'Bob', email: 'bob@test.com' },
        { id: 3, name: 'Alice', email: 'alice2@test.com' }
      ]
    })

    it('should return matching users when search params match', function () {
      const result = handler.findUsers({ name: 'Alice' })

      assert.strictEqual(result.length, 2)
      assert.strictEqual(result[0].id, 1)
      assert.strictEqual(result[1].id, 3)
    })

    it('should throw an error when no search parameters are provided', function () {
      assert.throws(
        () => handler.findUsers(),
        (err) => {
          assert(err instanceof Error)
          assert.strictEqual(err.message, 'No search parameters provoded!')
          return true
        }
      )
    })

    it('should throw an error when null is passed as search params', function () {
      assert.throws(
        () => handler.findUsers(null),
        (err) => {
          assert(err instanceof Error)
          assert.strictEqual(err.message, 'No search parameters provoded!')
          return true
        }
      )
    })

    it('should throw an error when no users are loaded', function () {
      handler.users = []

      assert.throws(
        () => handler.findUsers({ name: 'Alice' }),
        (err) => {
          assert(err instanceof Error)
          assert.strictEqual(err.message, 'No users loaded!')
          return true
        }
      )
    })

    it('should throw an error when no matching users are found', function () {
      assert.throws(
        () => handler.findUsers({ name: 'Zoe' }),
        (err) => {
          assert(err instanceof Error)
          assert.strictEqual(err.message, 'No matching users found!')
          return true
        }
      )
    })
  })
})

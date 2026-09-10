const assert = require('assert')
const nock = require('nock')
const UserDataHandler = require('../src/data_handlers/user_data_handler')

describe('UserDataHandler (nock - HTTP mocking)', function () {
  let handler

  beforeEach(function () {
    handler = new UserDataHandler()
  })

  afterEach(function () {
    nock.cleanAll()
  })

  describe('loadUsers - success', function () {
    it('should load users from the API and store them', async function () {
      const mockUsers = [
        { id: 1, name: 'Alice', email: 'alice@test.com' },
        { id: 2, name: 'Bob', email: 'bob@test.com' }
      ]

      nock('http://localhost:3000')
        .get('/users')
        .reply(200, mockUsers)

      await handler.loadUsers()

      assert.deepStrictEqual(handler.users, mockUsers)
    })

    it('should replace existing users when loadUsers is called again', async function () {
      handler.users = [{ id: 99, name: 'Old' }]
      const newUsers = [{ id: 1, name: 'New' }]

      nock('http://localhost:3000')
        .get('/users')
        .reply(200, newUsers)

      await handler.loadUsers()

      assert.deepStrictEqual(handler.users, newUsers)
    })
  })

  describe('loadUsers - error', function () {
    it('should throw an error when the API returns a server error', async function () {
      nock('http://localhost:3000')
        .get('/users')
        .replyWithError('Connection refused')

      await assert.rejects(
        () => handler.loadUsers(),
        (err) => {
          assert(err instanceof Error)
          assert(err.message.includes('Failed to load users data'))
          return true
        }
      )
    })

    it('should throw an error when the API returns a 500 status', async function () {
      nock('http://localhost:3000')
        .get('/users')
        .reply(500, 'Internal Server Error')

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
})

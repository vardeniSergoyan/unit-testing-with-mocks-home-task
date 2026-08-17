require('dotenv').config()

const { expect } = require('chai')
const { user } = require('./data/users')
const UserDataHandler = require('../src/data_handlers/user_data_handler')
const sinon = require('sinon')
const axios = require('axios').default
const nock = require('nock')

describe('UserDataHandler', () => {
  let handler

  beforeEach(() => {
    handler = new UserDataHandler()
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('Check Constructor', () => {
    it('Should initialize users as an empty array', () => {
      expect(handler.users).to.deep.equal([])
    })
  })

  describe('Check getNumberOfUsers function', () => {
    it('Should return 0 when no users are loaded', () => {
      expect(handler.getNumberOfUsers()).to.equal(0)
    })

    it('Should not return 0 when users are loaded', () => {
      handler.users = [
        { email: 'user1@test.com' },
        { email: 'user2@test.com' }
      ]
      expect(handler.getNumberOfUsers()).not.to.equal(0)
      expect(handler.getNumberOfUsers()).to.equal(2)
    })
  })

  describe('Check getUserEmailsList function', () => {
    it('Should throw error when no users are loaded', () => {
      expect(() => handler.getUserEmailsList())
        .to.throw('No users loaded!')
    })

    it('Should return users list when users are loaded', () => {
      handler.users = [
        { email: 'user1@test.com' },
        { email: 'user2@test.com' }
      ]
      expect(handler.getUserEmailsList()).to.equal('user1@test.com;user2@test.com')
    })
  })

  describe('Check isMatchingAllSearchParams function', () => {
    it('Should return true when user matches one search parameter', () => {
      expect(handler.isMatchingAllSearchParams(user, { role: 'admin' })).to.equal(true)
    })

    it('Should return true when user matches multiple search parameter', () => {
      expect(handler.isMatchingAllSearchParams(user, { role: 'admin', id: 1 })).to.equal(true)
    })

    it('Should return true when user matches one search parameter', () => {
      expect(handler.isMatchingAllSearchParams(user, { name: 'Ani' })).to.equal(false)
    })
  })

  describe('Check findUsers function', () => {
    it('Should return the user when one user matches', () => {
      handler.users = [user]
      const result = handler.findUsers({ role: 'admin' })
      expect(result).to.deep.equal([user])
    })

    it('Should throw error saying "No users loaded!" when no user loaded', () => {
      handler.users = []
      expect(() => handler.findUsers({ role: 'admin' }))
        .to.throw('No users loaded!')
    })

    it('Should throw error saying "No search parameters provoded!" when no search parameter provided', () => {
      expect(() => handler.findUsers())
        .to.throw('No search parameters provoded!')
    })

    it('Should throw error saying "No matching users found!" when no user matches', () => {
      handler.users = [user]
      expect(() => handler.findUsers({ name: 'Ani' }))
        .to.throw('No matching users found!')
    })
  })

  describe('Check loadUsers function using sinon', () => {
    it('Should load users successfully', async () => {
      const users = [user]
      sinon.stub(axios, 'get').resolves({
        data: users
      })
      await handler.loadUsers()
      expect(handler.users).to.deep.equal(users)
    })

    it('Should throw an error when loading users fails', async () => {
      sinon.stub(axios, 'get').rejects(new Error('Server error'))
      try {
        await handler.loadUsers()
        expect.fail('Expected loadUsers to throw an error')
      } catch (error) {
        expect(error.message)
          .to.equal('Failed to load users data: Error: Server error')
      }
    })
  })

  describe('Check loadUsers function using nock', () => {
    it('Should load users successfully', async () => {
      const users = [user]
      nock(process.env.API_BASE_URL)
        .get('/users')
        .reply(200, users)
      await handler.loadUsers()
      expect(handler.users).to.deep.equal(users)
    })

    it('Should throw an error when loading users fails', async () => {
      nock(process.env.API_BASE_URL)
        .get('/users')
        .reply(500)
      try {
        await handler.loadUsers()
        expect.fail('Expected loadUsers to throw an error')
      } catch (error) {
        expect(error.message).to.include('Failed to load users data')
      }
    })
  })
})

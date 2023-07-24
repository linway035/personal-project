import chai, { assert } from 'chai'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import app from '../app.js'
import pool from '../models/databasePool.js'

const should = chai.should()
const expect = chai.expect

describe('# login request', () => {
  context('signup request', () => {
    describe('User Registration', () => {
      it('should successfully register a new user', async () => {
        const newUser = {
          provider: 'native',
          name: 'Test User',
          email: 'testuser@test.com',
          password: 'testPassword',
          checkPassword: 'testPassword'
        }
        const response = await request(app).post('/users/signup').send(newUser)
        const { userId, name } = response.body
        response.status.should.equal(200)
        assert.exists(userId)
        assert.strictEqual(name, newUser.name)
        const [users, fields] = await pool.execute(
          'SELECT * FROM users WHERE email = ?',
          [newUser.email]
        )
        assert.strictEqual(users.length, 1)
      })

      it('should return an error for missing required fields', async () => {
        const response = await request(app).post('/users/signup').send({
          provider: 'native',
          name: '',
          email: 'testuser@test.com',
          password: 'testPassword',
          checkPassword: 'testPassword'
        })

        expect(response.status).to.equal(500)
      })

      it('should return an error for password mismatch', async () => {
        const newUser = {
          provider: 'native',
          name: 'Test User',
          email: 'testuser@test.com',
          password: 'testPassword',
          checkPassword: 'mismatchPassword'
        }

        const response = await request(app)
          .post('/users/signup')
          .send(newUser)
          .expect(500)
      })

      it('should return an error for duplicate email registration', async () => {
        const newUser = {
          provider: 'native',
          name: 'Test User',
          email: 'testuser@test.com',
          password: 'testPassword',
          checkPassword: 'testPassword'
        }

        const response = await request(app)
          .post('/users/signup')
          .send(newUser)
          .expect(500)
      })

      after(async () => {
        await pool.execute('DELETE FROM users WHERE email = ?', [
          'testuser@test.com'
        ])
      })
    })
  })
  context('signin request', () => {
    describe('User Sign In', () => {
      const mockUser = {
        provider: 'native',
        name: 'Test User',
        email: 'testuser@test.com',
        password: 'testPassword',
        checkPassword: 'testPassword'
      }

      before(async () => {
        await request(app).post('/users/signup').send(mockUser)
      })

      after(async () => {
        await pool.execute('DELETE FROM users WHERE email = ?', [
          mockUser.email
        ])
      })

      it('should successfully sign in a user', async () => {
        const response = await request(app)
          .post('/users/signin')
          .send({
            email: mockUser.email,
            password: mockUser.password
          })
          .expect(200)

        expect(response.body).to.have.property('userId')
        expect(response.body).to.have.property('name')
        expect(response.body).to.have.property('avatar')
      })

      it('should return an error for missing email or password', async () => {
        const response = await request(app)
          .post('/users/signin')
          .send({
            email: '',
            password: ''
          })
          .expect(500)
      })

      it('should return an error for non-existing user', async () => {
        const response = await request(app)
          .post('/users/signin')
          .send({
            email: 'nonexistent@test.com',
            password: 'testPassword'
          })
          .expect(500)
      })

      it('should return an error for incorrect password', async () => {
        const response = await request(app)
          .post('/users/signin')
          .send({
            email: mockUser.email,
            password: 'incorrectPassword'
          })
          .expect(500)
      })
    })
  })
})

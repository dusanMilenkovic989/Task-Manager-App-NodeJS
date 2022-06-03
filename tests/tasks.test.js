'use strict'

const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOne, userTwo, taskOne, prepareDatabase } = require('./fixtures/db-setup')

beforeEach(prepareDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Master Node course',
        })
        .expect(201)

    // Assert that the database was changed correctly
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()

    // Assert that default completed property is set to false
    expect(task.completed).toEqual(false)
})

test('Should get all tasks for userOne', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    // Assert that the response is sending all tasks back to the user
    expect(response.body.length).toEqual(2)
})

test('Should not be able to delete task owned by another user', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    // Assert that the task did not get deleted
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})
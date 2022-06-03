'use strict'

const Mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new Mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Ivan',
    email: 'ivan@example.com',
    password: 'Dota123',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new Mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Nikola',
    email: 'nikola@example.com',
    password: 'Telekom',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new Mongoose.Types.ObjectId(),
    description: 'First',
    completed: false,
    authorId: userOneId
}

const taskTwo = {
    _id: new Mongoose.Types.ObjectId(),
    description: 'Second',
    completed: true,
    authorId: userOneId
}

const taskThree = {
    _id: new Mongoose.Types.ObjectId(),
    description: 'Third',
    completed: false,
    authorId: userTwoId
}

const prepareDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwo,
    taskOne,
    prepareDatabase
}
'use strict'

const express = require('express')
require('./db/mongoose')
const usersRouter = require('./routers/users-router')
const tasksRouter = require('./routers/tasks-router')

const app = express()

app.use(express.json())
app.use(usersRouter)
app.use(tasksRouter)

module.exports = app
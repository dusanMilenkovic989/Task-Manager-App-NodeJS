'use strict'

const express = require('express')
const Task = require('../models/task')
const authentication = require('../middleware/authentication')

const tasksRouter = new express.Router()

tasksRouter.post('/tasks', authentication, async (req, res) => {
    const task = new Task({
        ...req.body,
        authorId: req.user._id
    })

    try {
        await task.save()

        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

tasksRouter.get('/tasks/:id', authentication, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, authorId: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

tasksRouter.get('/tasks', authentication, async (req, res) => {
    try {
        const match = req.query.completed ? { completed: req.query.completed === 'true' } : {}
        const sort = {}

        if (req.query.sortBy) {
            const sortParts = req.query.sortBy.split('_')
            sort[sortParts[0]] = sortParts[1] === 'asc' ? 1 : -1
        }

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

tasksRouter.patch('/tasks/:id', authentication, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({ error: 'You can not update task information with this data!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, authorId: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

tasksRouter.delete('/tasks/:id', authentication, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, authorId: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = tasksRouter
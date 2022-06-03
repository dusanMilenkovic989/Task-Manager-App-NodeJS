'use strict'

const express = require('express')
const multer = require('multer')
// const sharp = require('sharp')
const User = require('../models/user')
const authentication = require('../middleware/authentication')
const { welcomeEmail, goodbyeEmail } = require('../emails/accounts')

const usersRouter = new express.Router()

usersRouter.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        welcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

usersRouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

usersRouter.post('/users/logout', authentication, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

usersRouter.post('/users/logoutAll', authentication, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

usersRouter.get('/users/me', authentication, async (req, res) => {
    res.send(req.user)
})

usersRouter.patch('/users/me', authentication, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if (!isValid) {
        return res.status(400).send({ error: 'You can not update user information with this data!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

usersRouter.delete('/users/me', authentication, async (req, res) => {
    try {
        await req.user.remove()
        goodbyeEmail(req.user.email, req.user.name)
        
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('The only allowed file types are jpg, jpeg and png!'))
        }

        cb(undefined, true)
    },
})

usersRouter.post('/users/me/avatar', authentication, upload.single('avatar'), async (req, res) => {
    // const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    // req.user.avatar = buffer
    req.user.avatar = req.file.buffer
    await req.user.save()

    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

usersRouter.delete('/users/me/avatar', authentication, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()

    res.send()
})

usersRouter.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = usersRouter
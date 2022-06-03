'use strict'

const Mongoose = require('mongoose')

Mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true
})
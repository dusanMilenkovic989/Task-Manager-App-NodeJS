'use strict'

const Mongoose = require('mongoose')

const taskSchema = new Mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    authorId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
}) 

const Task = Mongoose.model('Task', taskSchema)

module.exports = Task
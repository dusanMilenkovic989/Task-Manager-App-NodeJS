'use strict'

const Mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new Mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('E-mail address you provided is not valid!')
            }
        }
    },
    password: {
        type: String,
        trim: true,
        minLength: 7,
        required: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password must not contain word "password" inside its value!')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age value must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// Creating virtual field for User schema in order to associate to Tasks created by that user
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'authorId'
})

// Reusable function required for generating and keeping track of tokens
userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)
    
    this.tokens = this.tokens.concat({ token })
    await this.save()

    return token
}

// Defining toJSON method for hiding some of the instance data when the data is stringified and being sent to the client
userSchema.methods.toJSON = function () {
    const userRaw = this.toObject()

    delete userRaw.password
    delete userRaw.tokens
    delete userRaw.avatar

    return userRaw
}

// Reusable function required for validation inside Login route
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login! Wrond E-mail or password.')
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
        throw new Error('Unable to login! Wrond E-mail or password.')
    }

    return user
}

// Middleware for executing function before saving user into db - hashing plain password
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

// Middleware for executing function before removing user from db - deleting all of that user tasks
userSchema.pre('remove', async function (next) {
    await Task.deleteMany({ authorId: this._id })

    next()
})

const User = Mongoose.model('User', userSchema)

module.exports = User
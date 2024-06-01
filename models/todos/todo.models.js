import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    subTodos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubTodo'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

export default mongoose.model('Todo', todoSchema)
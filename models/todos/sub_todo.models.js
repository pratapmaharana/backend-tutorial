import mongoose from "mongoose";

const subTodoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export default mongoose.model('SubTodo', subTodoSchema)
import mongoose from 'mongoose';
const subTodoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    complete: {
        type: Boolean,
        default: false,
        required: true,
    },
});
export const SubTodo = mongoose.Model('SubTodo', subTodoSchema);

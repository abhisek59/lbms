import mongoose,{Schema} from "mongoose";

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    biography: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true  
    }},{timestamps
:true});    

export const Author = mongoose.model('Author', authorSchema);
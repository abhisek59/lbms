import mongoose,{Schema} from "mongoose";   

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },  
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],       
        default: 'active'
    },
    books: [{
        type: Schema.Types.ObjectId,
        ref: 'Book'
    }],
}, {
    timestamps: true
});     
export const Category = mongoose.model("Category", categorySchema);
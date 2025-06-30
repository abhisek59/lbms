import mongoose,{Schema} from "mongoose";


const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author:{
        type: String,
        required: true,
        trim: true
    },
    publisher: {
        type: String,
        required: true,
        trim: true
    },
    publicationDate: {
        type: Date,
        required: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true  ,
    },
    edition:{
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Category",
        enum: ['available', 'checked out', 'reserved'],
        default: 'available',
        required: true
    },
    coverImage:{
        type: String, // Cloudinary URL
        required: true,
        trim: true
    },
    shelfLocation: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    pages: {
        type: Number,
        required: true,
        min: 1
    },
    copies: {
        total: {
            type: Number,
            required: true,
            min: 0,
            default: 1
        },
        available: {
            type: Number,
            required: true,
            min: 0,
            default: 1
        }
    },
    borrowHistory: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        borrowDate: {
            type: Date,
            required: true
        },
        returnDate: {
            type: Date
        }
    }],
},{
    timestamps: true
})
export const Book = mongoose.model("Book", bookSchema);
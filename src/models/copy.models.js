import mongoose,{Schema} from "mongoose";

const copySchema = new mongoose.Schema({
    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    copyNumber: {
        type: Number,
        required: true,
        min: 1  },
    status: {
        type: String,
        enum: ['available', 'checked out', 'reserved'],
        default: 'available',
        required: true
    },
    condition: {
        type: String,
        enum: ['new', 'good', 'fair', 'poor'],
        default: 'good',
        required: true  }
    },{
    timestamps: true
}); 


export const Copy = mongoose.model("Copy", copySchema); 
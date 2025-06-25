import mongoose,{Schema} from "mongoose";   

const reservationSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    reservationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active',
        required: true
    },
    pickupDate: {
        type: Date, 
        required: true
    },
    returnDate: {
        type: Date,
        required: true  
    }, 
    notes: {
        type: String,
        trim: true
    },
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    cancelReason: {
        type: String,
        trim: true
    },
    completedAt: {
        type: Date
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        reason: String
    }]
},{timestamps: true});  

export const Reservation = mongoose.model("Reservation", reservationSchema);
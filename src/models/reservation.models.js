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
    notificationSent: {
        type: Boolean,
        default: false
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
// Virtual to check if reservation is expired
reservationSchema.virtual('isExpired').get(function() {
    return this.status === 'active' && new Date() > this.pickupDate;
});

// Method to cancel reservation
reservationSchema.methods.cancel = function(reason) {
    this.status = 'cancelled';
    this.cancelReason = reason;
    this.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        reason: reason
    });
    return this.save();
};

// Method to complete reservation
reservationSchema.methods.complete = function() {
    this.status = 'completed';
    this.completedAt = new Date();
    this.statusHistory.push({
        status: 'completed',
        timestamp: new Date()
    });
    return this.save();
};


export const Reservation = mongoose.model("Reservation", reservationSchema);
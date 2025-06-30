import mongoose,{Schema} from "mongoose";

const borrowSchema = new mongoose.Schema({
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
    borrowDate: {
        type: Date,
        default: Date.now,
        required: true  
    },
    returnDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned', 'overdue'],
        default: 'borrowed',
        required: true
    },
    fine: {
        type: Number,
        default: 0,
        required: true
    },
     actualReturnDate: {
        type: Date,
    },
     renewals: {
        type: Number,
        default: 0,
        min: 0,
        max: 2 
    },
    notes: {
        type: String,
        trim: true
    },
    fineDetails: {
        amount: {
            type: Number,
            default: 0
        },
        paid: {
            type: Boolean,
            default: false
        },
        paymentDate: {
            type: Date
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'online'],
        }
    },
    renewalHistory: [{
        renewalDate: {
            type: Date,
            required: true
        },
        previousReturnDate: {
            type: Date,
            required: true
        },
        newReturnDate: {
            type: Date,
            required: true
        }
    }]
}, {
    timestamps: true
});    

export const Borrow = mongoose.model("Borrow", borrowSchema);
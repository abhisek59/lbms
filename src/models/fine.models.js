import mongoose from 'mongoose';    


const fineSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true  
    },
    borrowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrow',
        required: true
    },
    amount: {
        type: Number,
        required: true, 
    },
    reason:{
        type: String,
        required: true,
        trim: true  
    },
    paidStatus: {
        type: Boolean,
        default: false,     
    },
    paymentDate: {
        type: Date,
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online'],
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    paymentDetails: {
        transactionId: {
            type: String,
            trim: true
        },
        receiptNumber: {
            type: String,
            trim: true
        },
        paidBy: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        }
    },
    waived: {
        status: {
            type: Boolean,
            default: false
        },
        reason: {
            type: String,
            trim: true
        },
        waivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        waivedDate: {
            type: Date
        }
    }
},{timestamps:true});

export const Fine = mongoose.model('Fine', fineSchema);
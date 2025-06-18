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
    reminders: [{
        sentDate: {
            type: Date,
            required: true
        },
        method: {
            type: String,
            enum: ['email', 'sms', 'notification'],
            required: true
        },
        status: {
            type: String,
            enum: ['sent', 'failed', 'received'],
            required: true
        }
    }],
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

// Add indexes for better query performance
fineSchema.index({ userId: 1, paidStatus: 1 });
fineSchema.index({ borrowId: 1 });
fineSchema.index({ dueDate: 1, paidStatus: 1 });

// Virtual to calculate days overdue
fineSchema.virtual('daysOverdue').get(function() {
    if (this.paidStatus) return 0;
    return Math.max(0, Math.floor((new Date() - this.dueDate) / (1000 * 60 * 60 * 24)));
});

// Method to process payment
fineSchema.methods.processPayment = async function(paymentDetails) {
    this.paidStatus = true;
    this.paymentDate = new Date();
    this.paymentDetails = {
        ...paymentDetails,
        paidBy: this.userId
    };
    return this.save();
};

// Method to waive fine
fineSchema.methods.waiveFine = async function(reason, waivedBy) {
    this.waived.status = true;
    this.waived.reason = reason;
    this.waived.waivedBy = waivedBy;
    this.waived.waivedDate = new Date();
    this.paidStatus = true;
    return this.save();
};


export const Fine = mongoose.model('Fine', fineSchema);
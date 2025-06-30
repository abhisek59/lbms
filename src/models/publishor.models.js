import mongoose,{Schema} from "mongoose";  

const publishorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },
    bio: {
        type: String,
        required: true,
        trim: true  
    },
    contactInfo: {
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true
        },
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        },
        website: {
            type: String,
            trim: true
        }
    },
    logo: {
        type: String, // URL to logo image
        trim: true
    },
    established: {
        type: Date
    },
    books: [{
        type: Schema.Types.ObjectId,
        ref: 'Book'
    }],
    categories: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        linkedin: String,
        instagram: String
    }
}, {
    timestamps: true    
});


export const Publishor = mongoose.model("Publishor", publishorSchema);
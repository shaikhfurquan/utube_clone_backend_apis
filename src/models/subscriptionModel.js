import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

    // one who is subscribing
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // one to whom subscriber is subscribing
    chennel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, { timestamps: true });


export const subscriptionModel = mongoose.model('Subscription', subscriptionSchema)
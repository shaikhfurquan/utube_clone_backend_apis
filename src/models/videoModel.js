import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const videoSchema = new mongoose.Schema({

    videoFile: {
        type: String,
        required: [true, "Video file is required"],
    },
    thumbnail: {
        type: String,
        required: [true, "Thumbnail is required"],
    },
    title: {
        type: String,
        required : [true, "Title is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    duration: {
        type: String,
        required: [true, "Duration is required"]
    },
    views: {
        type: Number,
        default : 0 
    },
    isPublished : {
        type : Boolean,
        default : true
    },
    owner :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)

export const VideoModel = mongoose.model('Video', videoSchema)

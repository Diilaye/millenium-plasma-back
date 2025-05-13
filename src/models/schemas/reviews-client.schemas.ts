import {Schema} from "mongoose";
import {DateTime} from "luxon";

export const ReviewsClientSchemas : Schema = new Schema(
    {
        nomPersonnel: {type: String, default: null, required: false},

        comment: {type: String, default: null, required: false},

        telephonePersonnel: {type: String, default: null, required: false},

        nomClient: {type: String, default: null, required: false},

        telephoneClient: {type: String, default: null, required: false},

        serviceManagement : {type: String, default: null, required: false},

        rating: {type: Number, default: 5, required: false},

        isAvailable:  {type: Boolean, required: false , default: true},

        createdAt: {
            type: Date,
            default: () => DateTime.now().setZone('Africa/Dakar').toJSDate()
        },

        updatedAt: {
            type: Date,
            default: () => DateTime.now().setZone('Africa/Dakar').toJSDate()
        },

        updatedFields: { type: Object }
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    },
);


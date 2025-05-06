import {Schema} from "mongoose";
import {DateTime} from "luxon";

export const ServiceManagementSchemas : Schema = new Schema(
    {
        nom: {type: String, required: true},


        price:  {type: Number, required: true , default: 0},

        isAvailable : {type: Boolean, default: true},

        CratedAt: {
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


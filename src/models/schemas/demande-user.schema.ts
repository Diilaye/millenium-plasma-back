import {Schema} from "mongoose";
import {DateTime} from "luxon";

export const DemandeUserSchemas : Schema = new Schema(
    {
        phone: {type: String, required: true},


        isTreat:  {type: Boolean, required: true},

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


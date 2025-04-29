import {Schema} from "mongoose";
import {DateTime} from "luxon";

export const UserSchema: Schema = new Schema(
    {
        firstName: {type: String, required: true},

        lastName: {type: String, required: true,},

        email : {type: String, },

        phone : {type: String, required: true , unique: true},

        password: {type: String, required: true},

        passwords: [{
            type: String,
            default: []
        }],

        role: {
            type: String,
            enum: ["Admin", "User", "Client"],
            default: "Client"
        },

        statusOnline: {
            type: String,
            enum: ["on", "off", "del"],
            default: "on"
        },

        lastLogin: {
            type: Date,
            default: () => DateTime.now().setZone('Africa/Dakar').toJSDate()
        },

        isActive:  {type: Boolean, required: true},

        CratedAt: {
            type: Date,
            default: () => DateTime.now().setZone('Africa/Dakar').toJSDate()
        },

        updatedAt: {
            type: Date,
            default: () => DateTime.now().setZone('Africa/Dakar').toJSDate()
        },

        token: {
            type: String,
        },

        updatedFields: { type: Object }
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.passwords;
                delete ret.__v;
            },
        },
    },
);


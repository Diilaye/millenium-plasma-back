import mongoose, { Document, Schema } from 'mongoose';
import { DateTime } from "luxon";
  
  export const EmployerSchema: Schema = new Schema(
    {
      fullName: {
        type: String,
        required: true,
        trim: true
      },
      age: {
        type: Number,
        required: true,
      },
      phone: {
        type: String,
        required:true,
        unique: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      position: {
        type: String,
        required: true,
        trim: true
      },
      salary: {
        type: Number,
        required: true,
      },
      availability: {
        type: String,
        required:true,
        trim: true
      },
      status: {
        type: String,
        enum: ['available', 'unavailable', 'busy'],
        default: 'available'
      },
      photo: {
        type: String,
        default: 'default.jpg'
      },
      cv: {
        type: String,
        default: ''
      },
      certifications: {
        type: [String],
        default: []
      },
      experience: {
        type: String,
        required: true,
        trim: true
      },
      languages: {
        type: [String],
        required: true,
      },
      skills: {
        type: [String],
        required: true,
      },
      notes: {
        type: String,
        trim: true
      },
      isActive: {
        type: Boolean,
        default: false   
      }
    },
    {
      timestamps: true, // Ajoute automatiquement createdAt et updatedAt
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );
  
  

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  phone: {
    type: String,
  },
  specialization: {
    type: String,
    required: [true, 'Please provide a specialization'],
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide a license number'],
    unique: true,
  },
  hospital: {
    type: String,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  bio: {
    type: String,
  },
  profileImage: {
    type: String,
    default: '',
  },
  yearsOfExperience: {
    type: Number,
  },
  education: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expirationDate: Date,
  }],
  // Patients this doctor has requested to connect with or is connected to
  patients: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
    },
    patientName: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    responseDate: Date,
    notes: String,
  }],
  // Other doctor-specific fields
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified'],
    default: 'unverified',
  },
  availability: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  accessTokens: [{
    token: String,
    expires: Date,
    created: {
      type: Date,
      default: Date.now,
    },
  }],
});

// Update timestamps before saving
DoctorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema); 
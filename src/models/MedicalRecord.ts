import mongoose from 'mongoose';

// Define a schema for tracking edits made to the medical record
const EditHistorySchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
  },
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  editedBy: {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    doctorName: String, // For faster retrieval without joins
    specialization: String,
  },
  editedAt: {
    type: Date,
    default: Date.now,
  },
  note: String,
});

// Define a schema for doctor connection requests
const DoctorConnectionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  doctorName: String,
  specialization: String,
  profileImage: String,
  hospital: String,
  requestDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: String, // Why the doctor wants to connect
  responseDate: Date, // When the patient responded to the request
  notes: String, // Additional notes regarding the connection
});

const MedicalRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  personalInfo: {
    dateOfBirth: Date,
    gender: String,
    bloodType: String,
    height: Number, // in cm
    weight: Number, // in kg
    maritalStatus: String,
    occupation: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
  },
  allergies: [{
    allergen: String,
    severity: String,
    reaction: String,
    diagnosedDate: Date,
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    purpose: String,
  }],
  conditions: [{
    name: String,
    diagnosedDate: Date,
    status: String, // ongoing, resolved, etc.
    treatedBy: String,
    notes: String,
  }],
  surgeries: [{
    procedure: String,
    date: Date,
    hospital: String,
    surgeon: String,
    outcome: String,
    notes: String,
  }],
  immunizations: [{
    vaccine: String,
    date: Date,
    administeredBy: String,
    batchNumber: String,
  }],
  familyHistory: [{
    condition: String,
    relationship: String, // e.g., mother, father, sibling
    notes: String,
  }],
  lifestyle: {
    smokingStatus: String,
    alcoholConsumption: String,
    exerciseFrequency: String,
    diet: String,
    sleepPattern: String,
  },
  labTests: [{
    testName: String,
    date: Date,
    result: String,
    normalRange: String,
    orderedBy: String,
    laboratory: String,
    notes: String,
  }],
  imaging: [{
    type: String, // X-ray, MRI, CT, etc.
    date: Date,
    bodyPart: String,
    findings: String,
    facility: String,
    orderedBy: String,
  }],
  visits: [{
    date: Date,
    provider: String,
    reason: String,
    diagnosis: String,
    treatment: String,
    followUp: String,
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  // New fields for doctor connections
  connectedDoctors: [DoctorConnectionSchema],
  // Edit history to track changes made by doctors
  editHistory: [EditHistorySchema],
  // Access log to track when doctors view the record
  accessLog: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    doctorName: String,
    specialization: String,
    accessDate: {
      type: Date,
      default: Date.now,
    },
    accessType: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view',
    }
  }],
});

export default mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema); 
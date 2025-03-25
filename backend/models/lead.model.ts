import mongoose, { Document, Schema } from 'mongoose';

export interface ILead extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  status: LeadStatus;
  assignedTo?: string; // User ID
  createdBy: string; // User ID
  notes?: string;
  department?: string;
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  LOST = 'lost'
}

const LeadSchema = new Schema<ILead>({
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  phone: String,
  source: String,
  status: {
    type: String,
    enum: Object.values(LeadStatus),
    default: LeadStatus.NEW
  },
  assignedTo: {
    type: String,
    ref: 'User'
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: true
  },
  notes: String,
  department: String
}, {
  timestamps: true
});

// Indexes for performance
LeadSchema.index({ email: 1 });
LeadSchema.index({ createdBy: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ assignedTo: 1 });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
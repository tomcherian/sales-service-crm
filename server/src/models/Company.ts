import { model, Schema, Types } from 'mongoose';

export interface CompanyRecord {
  _id: Types.ObjectId;
  name: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<CompanyRecord>(
  {
    name: { type: String, required: true, trim: true },
    currency: { type: String, required: true, default: 'AED', uppercase: true }
  },
  { timestamps: true }
);

export const Company = model<CompanyRecord>('Company', companySchema);
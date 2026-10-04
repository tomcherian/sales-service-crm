import { model, Schema, Types } from "mongoose";

export type CustomerType = "retail" | "wholesale";

export interface CustomerRecord {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  type: CustomerType;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  assignedSalesperson?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<CustomerRecord>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["retail", "wholesale"], required: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    address: { type: String, trim: true },
    assignedSalesperson: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

customerSchema.index({ companyId: 1, type: 1 });
customerSchema.index({ companyId: 1, name: 1 });

export const Customer = model<CustomerRecord>("Customer", customerSchema);

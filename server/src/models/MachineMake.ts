import { model, Schema, Types } from "mongoose";

// A make is the brand on the machine (e.g. "Samsung"); companyName is the manufacturer behind it.
export interface MachineMakeRecord {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  companyName?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const machineMakeSchema = new Schema<MachineMakeRecord>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    country: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Strength 2 makes the uniqueness check case-insensitive ("LG" and "lg" collide).
machineMakeSchema.index(
  { companyId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

export const MachineMake = model<MachineMakeRecord>(
  "MachineMake",
  machineMakeSchema,
);

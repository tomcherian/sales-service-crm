import { model, Schema, Types } from "mongoose";

export const MACHINE_TYPES = [
  "front_load",
  "top_load",
  "semi_automatic",
  "washer_dryer",
] as const;
export type MachineType = (typeof MACHINE_TYPES)[number];

export interface MachineModelRecord {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  make: Types.ObjectId;
  // Named modelNumber because a "model" path would shadow Mongoose's own document.model().
  modelNumber: string;
  capacityKg: number;
  type: MachineType;
  // Prices are whole minor units of the company currency (fils for AED), so sums never drift.
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const price = {
  type: Number,
  required: true,
  min: 0,
  validate: {
    validator: Number.isInteger,
    message: "{PATH} must be a whole number of minor units",
  },
};

const machineModelSchema = new Schema<MachineModelRecord>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    make: { type: Schema.Types.ObjectId, ref: "MachineMake", required: true },
    modelNumber: { type: String, required: true, trim: true },
    capacityKg: { type: Number, required: true, min: 0 },
    type: { type: String, enum: MACHINE_TYPES, required: true },
    costPrice: price,
    retailPrice: price,
    wholesalePrice: price,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// One model number per make. Strength 2 makes the check case-insensitive ("F4" and "f4" collide).
machineModelSchema.index(
  { companyId: 1, make: 1, modelNumber: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);
machineModelSchema.index({ companyId: 1, type: 1, isActive: 1 });

export const MachineModel = model<MachineModelRecord>(
  "MachineModel",
  machineModelSchema,
);

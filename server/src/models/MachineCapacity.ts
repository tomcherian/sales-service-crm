import { model, Schema, Types } from "mongoose";

// The list of capacities a machine model may be given. Machine models copy the number
// rather than reference this record, so removing an option never changes existing machines.
export interface MachineCapacityRecord {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  capacityKg: number;
  createdAt: Date;
  updatedAt: Date;
}

const machineCapacitySchema = new Schema<MachineCapacityRecord>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    capacityKg: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

machineCapacitySchema.index({ companyId: 1, capacityKg: 1 }, { unique: true });

export const MachineCapacity = model<MachineCapacityRecord>(
  "MachineCapacity",
  machineCapacitySchema,
);

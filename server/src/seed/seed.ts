import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { Company } from "../models/Company.js";
import { User } from "../models/User.js";

try {
  await connectDatabase();

  const company = await Company.findOneAndUpdate(
    { name: env.SEED_COMPANY_NAME },
    { $setOnInsert: { name: env.SEED_COMPANY_NAME, currency: "AED" } },
    { upsert: true, new: true },
  );

  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
  await User.findOneAndUpdate(
    {
      companyId: company._id,
      email: env.SEED_ADMIN_EMAIL.toLowerCase(),
    },
    {
      $set: {
        name: env.SEED_ADMIN_NAME,
        passwordHash,
        role: "admin",
        isActive: true,
      },
      $setOnInsert: {
        companyId: company._id,
        email: env.SEED_ADMIN_EMAIL.toLowerCase(),
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  console.info(`Seeded demo admin: ${env.SEED_ADMIN_EMAIL}`);
} catch (error) {
  console.error("Seed failed", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

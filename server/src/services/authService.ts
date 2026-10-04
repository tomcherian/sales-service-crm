import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export interface SafeUser {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

function toSafeUser(user: {
  _id: { toString(): string };
  companyId: { toString(): string };
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}): SafeUser {
  // Explicitly map public fields so persistence-only values such as passwordHash cannot leak.
  return {
    id: user._id.toString(),
    companyId: user.companyId.toString(),
    name: user.name,
    email: user.email,
    ...(user.phone ? { phone: user.phone } : {}),
    role: user.role,
    isActive: user.isActive,
  };
}

export async function login(email: string, password: string) {
  // passwordHash is excluded by the schema unless this login check opts in to reading it.
  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+passwordHash")
    .exec();

  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(password, user.passwordHash))
  ) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    { companyId: user.companyId.toString() },
    env.JWT_SECRET,
    {
      subject: user._id.toString(),
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );

  return { token, user: toSafeUser(user) };
}

export async function getCurrentUser(
  userId: string,
  companyId: string,
): Promise<SafeUser> {
  // Recheck both tenant membership and account status on every authenticated profile request.
  const user = await User.findOne({
    _id: userId,
    companyId,
    isActive: true,
  }).lean();
  if (!user) throw new ApiError(401, "Account is inactive or no longer exists");
  return toSafeUser(user);
}

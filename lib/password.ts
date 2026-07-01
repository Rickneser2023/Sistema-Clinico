import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SEPARATOR = ":";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return salt + SEPARATOR + hash;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(SEPARATOR);
  if (!salt || !hash) return false;
  const compareHash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return timingSafeEqual(Buffer.from(compareHash), Buffer.from(hash));
}

import jwt, { JwtPayload as JsonWebTokenPayload, Secret, SignOptions } from "jsonwebtoken";

interface TokenPayload {
  userId: number;
}

const getJwtSecret = (): Secret => process.env.JWT_SECRET || "dev-secret";
const getJwtExpiresIn = (): SignOptions["expiresIn"] =>
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "30d";

export const createJWT = (payload: TokenPayload): string =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });

export const verifyJWT = (token: string): string | JsonWebTokenPayload =>
  jwt.verify(token, getJwtSecret());

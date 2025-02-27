import { Request } from "express";
import jwt from "jsonwebtoken";

export async function GetServerSession(request: Request): Promise<User | null> {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return null;
  }
  const verify = jwt.verify(token, process.env.SECRET_KEY!);
  if (!verify) {
    return null;
  }
  return verify as User;
}

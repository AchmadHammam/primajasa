import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { Http2ServerRequest } from "http2";
import jwt, { Jwt } from "jsonwebtoken";

export async function Middleware(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    response.sendStatus(HttpStatusCode.Unauthorized);
    return;
  }
  const verify = jwt.verify(token, process.env.SECRET_KEY!);
  if (!verify) {
    response.sendStatus(403);
    return;
  }
  next();
}

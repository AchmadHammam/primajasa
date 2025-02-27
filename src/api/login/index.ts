import { Request, Response } from "express";
import { loginValidation } from "@/lib/schema/login";
import prisma from "@/lib/database";
import bcrypt from "bcrypt";
import moment from "moment-timezone";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "axios";

export async function Login(request: Request, response: Response) {
  const body = await request.body;
  const date = moment.tz();
  const validaton = loginValidation.safeParse(body);
  if (validaton.success == false) {
    response.json(validaton.error).status(400);
    return;
  }
  const data = validaton.data;
  const user = await prisma.user.findFirst({
    where: {
      username: data?.username,
    },
    select: {
      id: true,
      username: true,
      password: true,
      nama: true,
      email: true,
    },
  });

  if (!user) {
    response.sendStatus(HttpStatusCode.Unauthorized);
    return;
  }
  console.log("a");
  var compareHash = await bcrypt.compare(data?.password.trim()!, user!.password.trim());
  if (compareHash == false) {
    response.sendStatus(HttpStatusCode.Unauthorized);
    return;
  }
  const token = jwt.sign(
    {
      username: user.username,
      email: user.email,
      nama: user.nama,
      id: user.id,
    },
    process.env.SECRET_KEY!,
    { expiresIn: "1h" }
  );

  // check one signal id
  var getOneSiganlId = await prisma.oneSignal.findFirst({
    where: {
      userId: user.id,
    },
  });
  if (!getOneSiganlId) {
    await prisma.oneSignal.create({
      data: {
        oneSignalId: data.oneSignalId!,
        userId: user.id,
        created_by: user.nama,
        updated_by: user.nama,
      },
    });
  } else {
    await prisma.oneSignal.update({
      where: {
        userId: user.id,
      },
      data: {
        oneSignalId: data.oneSignalId!,
        userId: user.id,
        // created_by: user.nama,
        updated_at: date.format(),
        updated_by: user.nama,
      },
    });
  }
  response.json({
    success: true,
    message: null,
    token: token,
  });
  return;
}

import { Request, Response } from "express";
import prisma from "@/lib/database";
import bcrypt from "bcrypt";
import { HttpStatusCode } from "axios";
import { registerValidation } from "@/lib/schema/register";

export async function Register(re: Request, res: Response) {
  const body = await re.body;
  const validaton = registerValidation.safeParse(body);

  if (validaton.error) {
    res.send(validaton.error).status(400);
    return;
  }
  const data = validaton.data;
  const user = await prisma.user.findFirst({
    where: {
      username: data?.username,
    },
  });
  if (user) {
    res.send({ message: "username already exist" }).sendStatus(HttpStatusCode.Conflict);
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(data?.password.trim()!, salt);
  const newUser = await prisma.user.create({
    data: {
      nama: data.nama,
      username: data?.username.trim()!,
      password: hash,
      email: data?.email.trim()!,
      created_by: data.username,
      updated_by: data.username,
      noHandpone: data.noHanphone,
    },
  });
  res
    .send({
      success: true,
      message: null,
      data: newUser,
    })
    .status(HttpStatusCode.Created);
  return;
}

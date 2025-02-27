import { GetServerSession } from "@/lib/auth";
import prisma from "@/lib/database";
import { PushNotification } from "@/lib/oneSiganl";
import { CreateTodolistValidation } from "@/lib/schema/checklist";
import { Request, Response } from "express";

export async function CreateCheckList(request: Request, response: Response) {
  const session = await GetServerSession(request);

  const body = await request.body;
  const validation = CreateTodolistValidation.safeParse(body);

  if (validation.success == false) {
    response
      .json({
        error: true,
        message: null,
        data: validation.error,
      })
      .status(400);
    return;
  }
  const data = validation.data;

  const checklist = await prisma.checklist.create({
    data: {
      userId: session!.id!,
      title: data.title,
      created_by: session?.nama!,
      updated_by: session?.nama!,
    },
  });
  const oneSignalId = await prisma.oneSignal.findFirst({
    where: {
      userId: session?.id!,
    },
  });
  var res = await PushNotification({
    message: "Kamu teleh membuat Checklist baru",
    oneSignalId: [oneSignalId?.oneSignalId!],
  });
  const p = await res.json();
  console.log(p);

  response.json({
    error: false,
    message: "berhasil membuat checklist",
    data: checklist,
  });
  return;
}

export async function GetCheckList(request: Request, response: Response) {
  const session = await GetServerSession(request);

  var page = request.query.page?.toString()!;
  var pageSize = request.query.pageSize?.toString()!;
  var pageSizeInt = parseInt(pageSize!);
  var pageInt = parseInt(page);

  const checklist = await prisma.checklist.findMany({
    where: {
      userId: session?.id!,
    },
    select: {
      id: true,
      title: true,
      done: true,
      created_at: true,
      updated_at: true,
      items: {
        select: {
          done: true,
          item: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: {
          updated_at: "desc",
        },
      },
    },
    orderBy: {
      updated_at: "desc",
    },
    take: pageSizeInt,
    skip: (pageInt - 1) * pageSizeInt,
  });
  var count = await prisma.checklist.count({});

  var data = {
    count: count!,
    checklist: checklist!,
  };
  response.json({
    error: false,
    message: null,
    data: data,
  });
  return;
}

export async function UpdateCheckList(request: Request, response: Response) {
  const checkListId = request.params.checkListId;
  const session = await GetServerSession(request);
  const check = await prisma.checklist.findFirst({
    where: {
      id: parseInt(checkListId),
    },
  });
  if (!check) {
    response
      .json({
        error: true,
        message: null,
        data: "data tidak ditemukan",
      })
      .status(404);
    return;
  }
  const done = !check.done;
  const data = await prisma.checklist.update({
    where: {
      id: parseInt(checkListId),
    },
    data: {
      done: done,
      updated_by: session?.nama,
    },
  });

  response.json({
    error: false,
    message: null,
    data: data,
  });
  return;
}

export async function DeleteCheckList(request: Request, response: Response) {
  const checkListId = request.params.checkListId;
  const session = await GetServerSession(request);
  const check = await prisma.checklist.findFirst({
    where: {
      id: parseInt(checkListId),
    },
  });
  if (!check) {
    response
      .json({
        error: true,
        message: null,
        data: "data tidak ditemukan",
      })
      .status(404);
    return;
  }
  const done = !check.done;
  const data = await prisma.checklist.delete({
    where: {
      id: check.id,
    },
  });

  response.json({
    error: false,
    message: null,
    data: data,
  });
  return;
}

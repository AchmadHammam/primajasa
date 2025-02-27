import { GetServerSession } from "@/lib/auth";
import prisma from "@/lib/database";
import { PushNotification } from "@/lib/oneSiganl";
import { CreateTodolistValidation } from "@/lib/schema/checklist";
import { Request, Response } from "express";

export async function CreateItemList(request: Request, response: Response) {
  const session = await GetServerSession(request);
  const checkListId = parseInt(request.params.checkListId);

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

  const Itemlist = await prisma.items.create({
    data: {
      checkListId: checkListId,
      item: data.title,
      created_by: session?.nama!,
      updated_by: session?.nama!,
    },
  });
  console.log(Itemlist);

  const oneSignalId = await prisma.oneSignal.findFirst({
    where: {
      userId: session?.id!,
    },
  });
  var res = await PushNotification({
    message: "Kamu teleh membuat item baru",
    oneSignalId: [oneSignalId?.oneSignalId!],
  });
  response.json({
    error: false,
    message: "berhasil membuat Itemlist",
    data: Itemlist,
  });
  return;
}

export async function GetItemList(request: Request, response: Response) {
  const session = await GetServerSession(request);
  const checkListId = parseInt(request.params.checkListId);

  var page = request.query.page?.toString()!;
  var pageSize = request.query.pageSize?.toString()!;
  var pageSizeInt = parseInt(pageSize!);
  var pageInt = parseInt(page);

  const Itemlist = await prisma.items.findMany({
    where: {
      checkListId: checkListId!,
    },
    orderBy: {
      updated_at: "desc",
    },
    take: pageSizeInt,
    skip: (pageInt - 1) * pageSizeInt,
  });
  var count = await prisma.items.count({});

  var data = {
    count: count!,
    itemlist: Itemlist!,
  };
  console.log(data);

  response.json({
    error: false,
    message: null,
    data: data,
  });
  return;
}

export async function UpdateItemList(request: Request, response: Response) {
  const itemId = request.params.itemId;
  const checkListId = request.params.checkListId;

  const session = await GetServerSession(request);
  const item = await prisma.items.findFirst({
    where: {
      id: parseInt(itemId),
    },
  });
  if (!item) {
    response
      .json({
        error: true,
        message: null,
        data: "data tidak ditemukan",
      })
      .status(404);
    return;
  }
  const done = !item.done;
  const data = await prisma.items.update({
    where: {
      id: parseInt(itemId),
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

export async function DeleteItemList(request: Request, response: Response) {
  const itemId = request.params.itemId;
  const checkListId = request.params.checkListId;

  const session = await GetServerSession(request);
  const item = await prisma.items.findFirst({
    where: {
      id: parseInt(itemId),
    },
  });
  if (!item) {
    response
      .json({
        error: true,
        message: null,
        data: "data tidak ditemukan",
      })
      .status(404);
    return;
  }
  const done = !item.done;
  const data = await prisma.items.delete({
    where: {
      id: parseInt(itemId),
    },
  });

  response.json({
    error: false,
    message: null,
    data: data,
  });
  return;
}

import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Middleware } from "@/middleware";
import { Login } from "@/api/login";
import { GetServerSession } from "./lib/auth";
import { Register } from "./api/register";
import { CreateCheckList, DeleteCheckList, GetCheckList, UpdateCheckList } from "./api/checklist";
import { CreateItemList, DeleteItemList, GetItemList, UpdateItemList } from "./api/item";

dotenv.config();
const app: Express = express();
const port = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

app.post("/login", Login);
app.post("/register", Register);

app.post("/checklist", Middleware, CreateCheckList);
app.get("/checklist", Middleware, GetCheckList);
app.put("/checklist/:checkListId", Middleware, UpdateCheckList);
app.delete("/checklist/:checkListId", Middleware, DeleteCheckList);

app.post("/checklist/:checkListId/item", Middleware, CreateItemList);
app.get("/checklist/:checkListId/item", Middleware, GetItemList);
app.put("/checklist/:checkListId/item/:itemId", Middleware, UpdateItemList);
app.delete("/checklist/:checkListId/item/:itemId", Middleware, DeleteItemList);

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
});

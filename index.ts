import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";
import db, { records } from "./db";
import { getDetailOfFile, getFileList, removeFile } from "./utils";
import { SQL, and, desc, eq, gte, like, lte } from "drizzle-orm";

import { CronJob } from "cron";
//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.get("/syncron", async (req: Request, res: Response) => {
  syncronize();

  res.json({ message: "Syncronized" });
});

app.get("/records", async (req: Request, res: Response) => {
  const limit = (req.query.limit && +req.query.limit) || 10;
  const offset = (req.query.offset && +req.query.offset) || 0;

  const startTo = (req.query.startTo || "") as string;
  const endTo = (req.query.endTo || "") as string;
  const search = (req.query.search || "") as string;

  const where: SQL[] = [];

  if (startTo) {
    where.push(gte(records.createdAt, startTo));
  }

  if (endTo) {
    where.push(lte(records.createdAt, endTo));
  }

  if (search) {
    where.push(like(records.name, `%${search}%`));
  }

  const results = await db
    .select()
    .from(records)
    .where(and(...where))
    .orderBy(desc(records.id))
    .limit(limit)
    .offset(offset);

  res.json(results);
});

app.get("/records/:id", async (req: Request, res: Response) => {
  const idRecord = +req.params.id;
  const row = await db.select().from(records).where(eq(records.id, idRecord));

  if (row.length === 0) {
    return res.status(404).json({ message: "Not Found" });
  }

  res.json(row[0]);
});

app.get("/records/:id/download", async (req: Request, res: Response) => {
  const idRecord = +req.params.id;
  const row = await db.select().from(records).where(eq(records.id, idRecord));

  if (row.length === 0) {
    return res.status(404).json({ message: "Not Found" });
  }

  const path = row[0].path;
  res.download(path);
});

app.delete("/records/:id", async (req: Request, res: Response) => {
  const idRecord = +req.params.id;
  const row = await db.select().from(records).where(eq(records.id, idRecord));

  if (row.length === 0) {
    return res.status(404).json({ message: "Not Found" });
  }

  const record = row[0];

  await removeFile(record.path);
  await db.delete(records).where(eq(records.id, idRecord));
  res.json({ message: "Deleted" });
});

app.use();

// catch all errors
app.use((err: any, req: Request, res: Response, next: any) => {
  console.log(err);
  res.status(500).json({ message: "Internal Server Error", error: err });
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
  job.start();
});

const job = new CronJob(
  "0 0 12 * * *",
  async () => {
    syncronize();
  },
  null,
  true,
  "Europe/Bucharest"
);

const syncronize = async () => {
  // ia fisierele
  const files = await getFileList(process.env.DIR_RECORDS || "");

  // ia stats ale fisierelor
  // creaza values as array
  const stats = [];
  for await (let file of files) {
    const stat = await getDetailOfFile(file);
    stats.push(stat);
  }

  await db.insert(records).values(stats).onConflictDoNothing();
};

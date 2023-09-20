import express, { Request, Response, Application, NextFunction } from "express";
import dotenv from "dotenv";
import { SQL, and, desc, eq, gte, like, lte } from "drizzle-orm";
import { CronJob } from "cron";
import fs from "fs";
import db, { records } from "./db";
import {
  getDetailOfFile,
  getFileList,
  getMimeType,
  getStatOfPath,
  removeFile,
  checkIfTheFileIsAudio,
} from "./utils";

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use((req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers.authorization || req.query.token) as string;

  if (
    !token ||
    token.replace("Bearer ", "").trim() !== process.env.ACCESS_TOKEN
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
});

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

/**
 * Only for audio html
 * <audio controls="controls">
 *  <source src="http://api/records/:id/liste-audio" type="audio/ogg" />
 *  <source src="http://api/records/:id/liste-audio" type="audio/mpeg" />
 *  Your browser does not support the audio element.
 * </audio>
 */
app.get("/records/:id/listen-audio", async (req: Request, res: Response) => {
  const idRecord = +req.params.id;
  const row = await db.select().from(records).where(eq(records.id, idRecord));

  if (row.length === 0) {
    return res.status(404).json({ message: "Not Found" });
  }

  // check mime type if is audio
  const path = row[0].path;
  const stat = getStatOfPath(path);

  const isAudio = checkIfTheFileIsAudio(path);

  if (!isAudio) {
    return res.status(400).json({ message: "The file is not an audio file" });
  }

  let readStream;

  if (req.headers.range) {
    const parts = req.headers.range.replace(/bytes=/, "").split("-");
    const partial_start: any = parts[0];
    const partial_end: any = parts[1];

    if (
      typeof (isNaN(partial_start) && partial_start.length > 1) ||
      (isNaN(partial_end) && partial_end.length > 1)
    ) {
      return res.status(500).json({ message: "Invalid Range" });
    }

    const start = parseInt(partial_start, 10);
    const end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
    const content_length = end - start + 1;

    res.status(206).writeHead(206, {
      "Content-Type": getMimeType(path) || "binary/octet-stream",
      "Content-Length": content_length,
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
    });

    readStream = fs.createReadStream(path, { start, end });
  } else {
    console.log("new plaing ...");
    res.writeHead(206, {
      "Content-Type": getMimeType(path) || "binary/octet-stream",
      "Content-Length": stat.size,
    });
    readStream = fs.createReadStream(path);
  }

  readStream.pipe(res);
});

app.get("/records/:id/download", async (req: Request, res: Response) => {
  const idRecord = +req.params.id;
  const row = await db.select().from(records).where(eq(records.id, idRecord));

  if (row.length === 0) {
    return res.status(404).json({ message: "Not Found" });
  }

  // limit to 100 mb to download
  const stat = getStatOfPath(row[0].path);
  const SIZE_DOWNLOAD_LIMIT = +process.env.SIZE_DOWNLOAD_LIMIT! || 100;

  if (stat.size > SIZE_DOWNLOAD_LIMIT * 1024 * 1024) {
    return res.status(400).json({
      message: `The file is too large. The limit is ${SIZE_DOWNLOAD_LIMIT} MB`,
    });
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
  try {
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
  } catch (err) {
    console.log(err);
  }
};

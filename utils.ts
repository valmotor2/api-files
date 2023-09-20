import fs from "fs";
import mime from "mime";
import moment from "moment";

export const getFileList = async (dirName: string) => {
  if (dirName === "") {
    throw new Error("dirName is empty");
  }

  let files: string[] = [];
  const items = await fs.readdirSync(dirName, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...(await getFileList(`${dirName}/${item.name}`))];
    } else {
      files.push(`${dirName}/${item.name}`);
    }
  }
  return files;
};

export const getMimeType = (path: string) => mime.getType(path);

export const getStatOfPath = (path: string) => fs.statSync(path);

export const checkIfTheFileIsAudio = (path: string) => {
  const mime_type = getMimeType(path);
  return mime_type?.startsWith("audio/");
};

export const getDetailOfFile = async (path: string) => {
  const file = fs.statSync(path);
  const extension = path.split(".").pop();
  const name = path.split("/").pop();
  let mime_type = getMimeType(path);

  if (!name || !extension) {
    throw new Error("name or extension is empty");
  }

  if (!mime_type) {
    mime_type = "unknown";
  }

  return {
    name,
    path,
    extension,
    size: file.size,
    type: mime_type,
    createdAt: moment(file.birthtime).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment(file.ctime).format("YYYY-MM-DD HH:mm:ss"),
  };
};

export const removeFile = async (path: string) => fs.unlinkSync(path);

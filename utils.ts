import fs from "fs/promises";
import mime from "mime";
import moment from "moment";
export const getFileList = async (dirName: string) => {
  if (dirName === "") {
    throw new Error("dirName is empty");
  }

  let files: string[] = [];
  const items = await fs.readdir(dirName, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...(await getFileList(`${dirName}/${item.name}`))];
    } else {
      files.push(`${dirName}/${item.name}`);
    }
  }
  return files;
};

export const getDetailOfFile = async (path: string) => {
  const file = await fs.stat(path);
  const extension = path.split(".").pop();
  const name = path.split("/").pop();
  const mime_type = mime.getType(path);

  if (!name || !extension || !mime_type) {
    throw new Error("name, extension or mime_type is empty");
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

export const removeFile = async (path: string) => fs.unlink(path);

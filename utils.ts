import fs from "fs";
import mime from "mime";
import moment from "moment";

export const getFiles = async (dir: string, files: string[] = []) => {
  // Get an array of all files and directories in the passed directory using fs.readdir>
  const fileList = fs.readdirSync(dir);
  // Create the full path of the file/directory by concatenating the passed directory a>
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the director>
      getFiles(name, files);
    } else {
      // If it is a file, push the full path to the files array
      files.push(name);
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

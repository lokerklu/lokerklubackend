import dotenv from "dotenv";
export const runtime = 'edge';
import download from "download"; 
import { put,del } from "@vercel/blob";

dotenv.config()

export const store = async (file) => {
    const fileName = new Date().getTime() + "-" + file.originalname
    const blob = await put(fileName, file.buffer, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
      access: 'public'
    });
    return blob;
}

export const remove = async (url) => {
  const urlDelete = url.toString()
  await del(urlDelete, {
    token: process.env.BLOB_READ_WRITE_TOKEN
  });
  return new Response();
}

export const downloadfile = async (url) => {
  const file = await download(url)
  return file
}

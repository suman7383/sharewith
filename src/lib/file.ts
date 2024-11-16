import { TFileDetails } from "@/hooks/useFileUpload";
import { FILE_ACTION } from "@/types";
import axios, { AxiosError } from "axios";
import SparkMD5 from "spark-md5";

const CHUNK_SIZE = 1024 * 1024; // 1 MB

export const chunkAndUpload = async (
  fileDetails: TFileDetails,
  file: File,
  action: FILE_ACTION,
  cb: (data: {
    success: boolean;
    error: string | null;
    chunkIdx: number;
    isCompleted: boolean;
  }) => void
) => {
  const totalChunks = fileDetails.totalChunks;

  console.log("total size -> ", file.size);

  for (let i = 0; i < totalChunks; i++) {
    //send the next chunk
    const from = i * CHUNK_SIZE;
    const to = Math.min((i + 1) * CHUNK_SIZE, file.size + 1);
    console.log("------------------------------------------------");
    console.log(`Chunk ${i} from ${from} to ${to}`);

    const chunk = file.slice(from, to);
    const formData = new FormData();

    formData.append("fileChunk", chunk);
    formData.append("originalName", file.name);
    formData.append("md5", fileDetails.md5);
    formData.append("currentChunk", i.toString());
    formData.append("totalChunks", totalChunks.toString());
    formData.append("action", action);

    try {
      const res = await uploadChunk(formData);

      console.log(res);
      if (res.success) {
        console.log(res.data);
        cb({
          chunkIdx: i,
          success: true,
          error: null,
          isCompleted: res.data?.isComplete || false,
        });
      } else {
        console.log(res.message);
        cb({
          chunkIdx: i,
          success: false,
          error: res.message,
          isCompleted: false,
        });
        break;
      }
    } catch (err) {
      console.log(err);
      cb({
        chunkIdx: i,
        success: false,
        error: "Internal Server Error",
        isCompleted: false,
      });
      break;
    }
  }
};

const uploadChunk = async (formData: FormData) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    console.log(response.data);
    return {
      success: true,
      chunkUploaded: formData.get("currentChunk")!,
      data: response.data.data as TChunkUploadResponseData,
    };
  } catch (err) {
    console.log(err);
    if (err instanceof AxiosError) {
      return {
        success: false,
        message: err.response?.data?.msg || "Internal Server Error",
        chunkFailed: formData.get("currentChunk"),
        data: null,
      };
    }

    return {
      success: false,
      message: "Internal Server Error",
      chunkFailed: formData.get("currentChunk"),
      data: null,
    };
  }
};

export const calculateFileDetails = (
  file: File,
  chunkSize: number = 1024 * 1024
) => {
  const totalSize = file.size;
  const totalChunks = Math.ceil(totalSize / chunkSize);
  const extension = file.name.split(".").pop() as string;
  return { totalSize, totalChunks, extension };
};

export const getFileSize = (size: number) => {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

export const getFileMD5 = (file: File): Promise<string> => {
  //generate hash using spark-md5
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer);
        resolve(spark.end());
      } else {
        reject("Failed to calculate file MD5");
      }
    };
  });
};

export type TChunkUploadResponseData = {
  processedChunks: number;
  isComplete: boolean;
  isFailed: boolean;
  action: "encrypt" | "decrypt";
};

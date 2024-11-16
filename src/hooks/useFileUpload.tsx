"use client";

import { createUploadSession } from "@/actions/upload";
import { calculateFileDetails, chunkAndUpload, getFileMD5 } from "@/lib/file";
import { FILE_ACTION } from "@/types";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export interface TFileDetails {
  name: string;
  md5: string;
  extension: string;
  totalSize: number;
  totalChunks: number;
  currUploadChunk: number;
}

export enum UPLOAD_STATUS {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export default function useFileUpload() {
  const [file, setFile] = useState<File>();
  const [fileDetails, setFileDetails] = useState<TFileDetails | null>(null);
  // const [currChunkIdx, setCurrChunkIdx] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<UPLOAD_STATUS>(
    UPLOAD_STATUS.NOT_STARTED
  );
  const [password, setPassword] = useState<string>("");

  const clearFile = useCallback(() => {
    setFile(undefined);
    setFileDetails(null);
    setUploadStatus(UPLOAD_STATUS.NOT_STARTED);
  }, []);

  const onSetFile = useCallback(async (file: File) => {
    //check whether file is valid and file size is <= 20MB
    if (!file) {
      clearFile();
      return;
    }

    let fileMd5: string | null = null;

    try {
      fileMd5 = await getFileMD5(file);
    } catch (e) {
      toast.error(`Failed to calculate file MD5: ${e}`);
      return;
    }

    if (!fileMd5) return;

    setFile(file);

    const chunkDetails = calculateFileDetails(file);
    setFileDetails({
      ...chunkDetails,
      name: file.name,
      md5: fileMd5,
      currUploadChunk: 0,
    });
  }, []);

  const initiateUpload = async (action: FILE_ACTION) => {
    if (!file || !fileDetails || !password || password.length < 8) return;

    // if (uploadStatus === UPLOAD_STATUS.SUCCESS) {
    //   return;
    // }

    //send the password and file details and get the uploadID
    const session = await createUploadSession({
      md5: fileDetails.md5,
      key: password,
      fileExtension: fileDetails.extension,
      fileOrigninalname: file.name,
      action,
    });

    if (!session || !session.success) {
      toast.error(session?.message);
      return;
    }

    if (uploadStatus === UPLOAD_STATUS.NOT_STARTED) {
      setUploadStatus(UPLOAD_STATUS.IN_PROGRESS);
    }

    await chunkAndUpload(
      fileDetails,
      file,
      action,
      ({
        chunkIdx,
        error,
        success,
        isCompleted,
      }: {
        success: boolean;
        error: string | null;
        chunkIdx: number;
        isCompleted: boolean;
      }) => {
        if (error) {
          toast.info(`Failed to upload chunk ${chunkIdx}: ${error}`);
          setUploadStatus(UPLOAD_STATUS.FAILED);
        }

        if (success) {
          setFileDetails((prev) => ({
            ...prev!,
            currUploadChunk: chunkIdx + 1,
          }));
          if (isCompleted) {
            toast.info(`File uploaded successfully`);
            setUploadStatus(UPLOAD_STATUS.SUCCESS);
          } else {
            console.info(
              `Uploaded ${chunkIdx}/${fileDetails.totalChunks} chunks`
            );
          }
        }
      }
    );
  };

  return {
    onSetFile,
    fileDetails,
    clearFile,
    initiateUpload,
    uploadStatus,
    password,
    setPassword,
  };
}

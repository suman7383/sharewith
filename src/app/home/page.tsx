"use client";

import { checkIsAuthorized } from "@/actions/user";
import CreateSession from "@/components/createSession";
import FileDetails from "@/components/fileDetails";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import UploadComponent from "@/components/upload";
import useFileUpload, { UPLOAD_STATUS } from "@/hooks/useFileUpload";
import { FILE_ACTION } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const {
    fileDetails: file,
    onSetFile,
    clearFile,
    initiateUpload,
    uploadStatus,
    password,
    setPassword,
  } = useFileUpload();

  const isAuthorizedPromise = () => {
    new Promise(async (resolve, reject) => {
      const data = await checkIsAuthorized();
      if (data && data.data) {
        setIsAuthorized(data.data.isAuthorized);
        resolve(data);
      } else {
        reject(data);
      }
    });
  };

  const handleEncrypt = async () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    await initiateUpload(FILE_ACTION.ENCRYPT);
  };

  const handleDecrypt = async () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    await initiateUpload(FILE_ACTION.DECRYPT);
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      toast.info(`File selected: ${file.name}`);
      await onSetFile(file);
    },
    [onSetFile]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];

    handleFileUpload(droppedFile);
  }, []);

  useEffect(() => {
    if (isAuthorized) return;
    isAuthorizedPromise();
  }, [isAuthorized]);

  return (
    <main className="w-full h-screen flex flex-col items-center justify-center">
      <div className="w-[360px]">
        <section
          className={`mb-4 border-2 border-dashed rounded-lg w-full h-[200px] border-gray-300 ${
            isDragging ? "border-3 border-primary" : "border-gray-300"
          }`}
        >
          {file ? (
            <FileDetails
              file={file}
              clearFile={clearFile}
              // setIsFileSelected={setIsFileSelected}
            />
          ) : (
            <UploadComponent
              handleDragLeave={handleDragLeave}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleFileUpload={handleFileUpload}
              isDragging={isDragging}
            />
          )}
        </section>
        {uploadStatus !== UPLOAD_STATUS.NOT_STARTED && (
          <section className="my-5">
            <Progress
              value={
                file
                  ? (file.currUploadChunk / (file.totalChunks || 1)) * 100
                  : 0
              }
              color="green"
            />
            <span
              className={`w-full flex justify-center mt-2 ${
                uploadStatus === UPLOAD_STATUS.SUCCESS && "text-green-500"
              } ${uploadStatus === UPLOAD_STATUS.FAILED && "text-red-500"}`}
            >
              {file ? (file.currUploadChunk / file.totalChunks) * 100 : 0}%
            </span>
          </section>
        )}
        <section className="flex flex-col gap-4 w-full">
          <CreateSession
            name="password"
            value={password}
            onChange={setPassword}
          />
          <div className="w-full flex gap-4">
            <Button
              variant="default"
              onClick={handleEncrypt}
              className="basis-1/2"
              disabled={
                file !== undefined &&
                uploadStatus !== UPLOAD_STATUS.IN_PROGRESS &&
                password.length >= 8
                  ? false
                  : true
              }
            >
              Encrypt
            </Button>
            <Button
              variant="secondary"
              onClick={handleDecrypt}
              className="basis-1/2"
              disabled={
                file !== undefined &&
                uploadStatus !== UPLOAD_STATUS.IN_PROGRESS &&
                password.length >= 8
                  ? false
                  : true
              }
            >
              Decrypt
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

export interface UserProps {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface FileProps {
  uploadId: string;
  status: FILE_STATUS;
  chunkSize: number;
  fileOriginalname: string;
  fileExtension: string;
}

export enum FILE_STATUS {
  WAITING_UPLOAD = "waiting_upload",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export enum FILE_ACTION {
  "ENCRYPT" = "encrypt",
  "DECRYPT" = "decrypt",
}

export type AxiosResponseData =
  | {
      success: true;
      data: unknown;
      message: string;
    }
  | {
      success: false;
      data: null;
      message: string;
    };

export type AxiosResponseError = {
  type: string;
  statusCode: number | string;
  data: {
    errMsg: string;
    generatedTime: Date | string;
    msg: string;
  };
};

"use server";

import { AxiosResponseData, AxiosResponseError, FILE_ACTION } from "@/types";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

export async function createUploadSession({
  md5,
  fileExtension,
  fileOrigninalname,
  key,
  action,
}: IUploadSession) {
  try {
    const cookie = cookies().get("token");
    if (!cookie) return;

    const response = await axios.post(
      `${process.env.SERVER_URL}/session/upload`,
      {
        md5,
        key,
        fileOrigninalname,
        fileExtension,
        action,
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );

    return {
      ...(response.data as AxiosResponseData),
    };
  } catch (err) {
    console.log(err);
    if (err instanceof AxiosError) {
      const errRes = err.response?.data as AxiosResponseError;
      return {
        success: false,
        data: null,
        message: errRes?.data?.msg || "Internal Server Error",
      };
    }
    return {
      success: false,
      data: null,
      message: "Internal Server Error",
    };
  }
}

interface IUploadSession {
  md5: string;
  key: string;
  fileOrigninalname: string;
  fileExtension: string;
  action: FILE_ACTION;
}

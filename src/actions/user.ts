"use server";

import { AxiosResponseData, AxiosResponseError } from "@/types";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";

export async function signupUser(data: TSignupUserProps) {
  try {
    console.log("here", data);
    const response = await axios.post(
      `${process.env.SERVER_URL}/auth/signup`,
      data,
      {
        withCredentials: true,
      }
    );

    return { ...(response.data as AxiosResponseData) };
  } catch (err) {
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

export async function loginUser(data: TLoginUserProps) {
  try {
    console.log("here", data);
    const response = await axios.post(
      `${process.env.SERVER_URL}/auth/login`,
      data,
      {
        withCredentials: true,
      }
    );

    const responseData = response.data as AxiosResponseData;

    if (responseData.success) {
      cookies().set("token", (responseData.data as { token: string }).token, {
        httpOnly: true,
        secure: false,
        maxAge: parseInt(process.env.COOKIE_MAX_AGE as string),
      });
    }

    console.log(response.data);
    return { ...(response.data as AxiosResponseData) };
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

export async function getGoogleConsentURL() {
  const rootUrl = process.env.GOOGLE_AUTH_ROOT_URL;

  if (!rootUrl) {
    return {
      success: false,
      data: null,
      message: "Internal Server Error",
    };
  }

  const options = {
    redirect_uri: process.env.GOOGLE_AUTH_REDIRECT_URI!,
    client_id: process.env.GOOGLE_AUTH_CLIENT_ID!,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  };

  const url = new URL(rootUrl);

  Object.keys(options).forEach((key) =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    url.searchParams.append(key, options[key])
  );

  return {
    success: true,
    data: {
      url: url.toString(),
    },
    message: "success",
  };
}

export async function checkIsAuthorized() {
  const token = cookies().get("token");

  if (!token)
    return { success: true, data: { isAuthorized: false }, message: "success" };
  else {
    return { success: true, data: { isAuthorized: true }, message: "success" };
  }
}

type TSignupUserProps = {
  name: string;
  email: string;
  password: string;
};

type TLoginUserProps = {
  email: string;
  password: string;
};

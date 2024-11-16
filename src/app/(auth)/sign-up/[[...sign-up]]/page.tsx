"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getGoogleConsentURL, signupUser } from "@/actions/user";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be less than 30 characters")
        .required("Password is required"),
    }),
    onSubmit: handleSignup,
  });

  function handleSignup(value: {
    name: string;
    email: string;
    password: string;
  }) {
    const createUserPromise = new Promise(async (resolve, reject) => {
      const data = await signupUser(value);

      if (data && data.success) {
        resolve(data);
        setTimeout(() =>
          router.push(`/${process.env.NEXT_PUBLIC_AFTER_SIGN_UP_URL}`)
        );
      } else reject(data);
    });

    toast.promise(createUserPromise, {
      loading: "Creating account...",
      success: () => "Account created successfully",
      error: (error) => `Error: ${error.message}`,
    });
  }

  const handleSignupWithGoogle = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const data = await getGoogleConsentURL();

    if (data.success && data.data) {
      // alert(data.data?.url);
      window.location.href = data.data?.url;
    } else {
      alert(data.message);
    }
  };

  useEffect(() => {
    router.replace("/sign-up");
  });

  return (
    <Card className="sm:w-[360px]">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create an account on shareWith</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="mb-2" onSubmit={formik.handleSubmit}>
          <div className="mb-4 space-y-4">
            <Input
              type="text"
              placeholder="Name"
              required
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-red-500">*{formik.errors.name}</p>
            )}
            <Input
              type="email"
              placeholder="Email"
              required
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-500">*{formik.errors.email}</p>
            )}
            <Input
              type="password"
              placeholder="Password"
              required
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500">*{formik.errors.password}</p>
            )}
          </div>
          <div className="flex-1">
            <Button className="w-full" type="submit">
              Sign Up
            </Button>
          </div>
        </form>
        <section className="space-y-2">
          <p className="text-center text-muted-foreground"> ---- or ---- </p>
          <Button
            className="w-full text-muted-foreground"
            variant="outline"
            onClick={handleSignupWithGoogle}
          >
            Sign up with Google
          </Button>
        </section>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground">Already have an account ?</p>
        <Button variant="link" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

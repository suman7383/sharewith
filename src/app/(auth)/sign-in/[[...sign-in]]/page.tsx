"use client";

import { useRouter } from "next/navigation";
// import { useEffect } from "react";
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
import { getGoogleConsentURL, loginUser } from "@/actions/user";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .max(30, "Password must be less than 30 characters")
        .required("Password is required"),
    }),
    onSubmit: handleSignIn,
  });

  function handleSignIn(value: { email: string; password: string }) {
    const loginUserPromise = new Promise(async (resolve, reject) => {
      const data = await loginUser(value);

      if (data && data.success) {
        resolve(data);
        setTimeout(
          () => router.push(`${process.env.NEXT_PUBLIC_AFTER_SIGN_IN_URL}`),
          3000
        );
      } else reject(data);
    });

    toast.promise(loginUserPromise, {
      loading: "Logging you in...",
      success: () => "Logged in successfully",
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

  // useEffect(() => {
  //   router.replace("/sign-in");
  // });

  return (
    <Card className="sm:w-[360px]">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Welcome back! Login to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="mb-2" onSubmit={formik.handleSubmit}>
          <div className="mb-4 space-y-4">
            <Input
              type="email"
              placeholder="Email"
              required
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500">*{formik.errors.email}</p>
            )}
            <Input
              type="password"
              placeholder="Password"
              required
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500">*{formik.errors.password}</p>
            )}
          </div>
          <div className="flex-1">
            <Button className="w-full" type="submit">
              Sign In
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
            Sign in with Google
          </Button>
        </section>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground">Don&apos;t have an account ?</p>
        <Button variant="link" asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

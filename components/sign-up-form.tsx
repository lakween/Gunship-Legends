"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FormInput from "@/src/common/FormInput";
import useForm from "@/src/hooks/useForm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [passwordError, setPasswordError] = useState(false)

  const { form, setForm, onChange } = useForm()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      console.log('working', result)

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      router.push("/auth/sign-up-success");
      // router.refresh();
    } catch (err: any) {
      console.log(err.message, 'err.message')
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (form?.password && form?.repeat_password) {
      if (form?.password !== form?.repeat_password) {
        setPasswordError(true);
        return;
      }
      else {
        setPasswordError(false);
      }
    }

  }, [JSON.stringify(form)])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <FormInput
                label={"First Name"}
                name={"first_name"}
                placeholder={"lakween"}
                form={form}
                onChange={onChange}
              />
              <FormInput
                label={"Last Name"}
                name={"last_name"}
                placeholder={"senathilake"}
                form={form}
                onChange={onChange}
              />
              <FormInput
                label={"Email"}
                name={"email"}
                placeholder={"Emai"}
                form={form}
                onChange={onChange}
              />
              <FormInput
                label={"Password"}
                name={"password"}
                placeholder={""}
                form={form}
                onChange={onChange}
              />
              <FormInput
                label={"Repeat Password"}
                name={"repeat_password"}
                placeholder={""}
                type="password"
                form={form}
                onChange={onChange}
              />
              {passwordError && <p className="text-sm text-red-500">Passwords not maching</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

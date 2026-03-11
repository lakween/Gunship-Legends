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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ValidationError } from "yup";
import { SignUpFormValues, signUpSchema } from "../schema";
import { signUpAction } from "../actions";

// ── Types ─────────────────────────────────────────────────────────────────
type FormFields = Partial<SignUpFormValues>;
type FormErrors = Partial<Record<keyof SignUpFormValues, string>>;

// ── Component ─────────────────────────────────────────────────────────────
export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [form, setForm]           = useState<FormFields>({});
  const [errors, setErrors]       = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ── Field change — validate single field on every keystroke ───────────
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    signUpSchema
      .validateAt(name, updated)
      .then(() => setErrors(prev => ({ ...prev, [name]: undefined })))
      .catch((err: ValidationError) =>
        setErrors(prev => ({ ...prev, [name]: err.message }))
      );
  };

  // ── Submit — validate all fields then call server action ──────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = await signUpSchema.validate(form, { abortEarly: false });

      const result = await signUpAction({
        first_name: validated.first_name,
        last_name:  validated.last_name,
        email:      validated.email,
        password:   validated.password,
      });

      if (!result.success) {
        toast.error(result.error || "Sign up failed");
        return;
      }

      router.push("/auth/sign-up-success");

    } catch (err) {
      if (err instanceof ValidationError) {
        const fieldErrors: FormErrors = {};
        err.inner.forEach(e => {
          if (e.path) fieldErrors[e.path as keyof SignUpFormValues] = e.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} noValidate>
            <div className="flex flex-col gap-4">

              <FormInput
                label="First Name"
                name="first_name"
                placeholder="Lakween"
                form={form}
                onChange={onChange}
                error={errors.first_name}
              />

              <FormInput
                label="Last Name"
                name="last_name"
                placeholder="Senathilake"
                form={form}
                onChange={onChange}
                error={errors.last_name}
              />

              <FormInput
                label="Email"
                name="email"
                placeholder="you@example.com"
                type="email"
                form={form}
                onChange={onChange}
                error={errors.email}
              />

              <FormInput
                label="Password"
                name="password"
                placeholder=""
                type="password"
                form={form}
                onChange={onChange}
                error={errors.password}
              />

              <FormInput
                label="Repeat Password"
                name="repeat_password"
                placeholder=""
                type="password"
                form={form}
                onChange={onChange}
                error={errors.repeat_password}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading || hasErrors}
              >
                {isLoading ? "Creating account..." : "Sign up"}
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
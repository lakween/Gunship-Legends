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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ValidationError } from "yup";
import { LoginFormValues, loginSchema } from "../schema";
import { loginAction } from "../actions";
import useForm from "@/hooks/useForm";
import FormInput from "@/components/common/FormInput";

// ── Types ──────────────────────────────────────────────────────────────────
type FormFields = Partial<LoginFormValues>;
type FormErrors = Partial<Record<keyof LoginFormValues, string>>;

// ── Component ──────────────────────────────────────────────────────────────
export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const { onChange, form } = useForm()
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const validated = await loginSchema.validate(form, { abortEarly: false });

            const result = await loginAction({
                email: validated.email,
                password: validated.password,
            });

            if (!result.success) {
                toast.error(result.error || "Login failed");
                return;
            }

            router.push("/app/heart-question");
            router.refresh();

        } catch (err) {
            if (err instanceof ValidationError) {
                const fieldErrors: FormErrors = {};
                err.inner.forEach(e => {
                    if (e.path) fieldErrors[e.path as keyof LoginFormValues] = e.message;
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
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} noValidate>
                        <div className="flex flex-col gap-6">
                            <FormInput
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                form={form as Record<string, string>}
                                onChange={onChange}
                                error={errors.email}
                            />

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium leading-none">Password</span>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>
                                <FormInput
                                    label=""
                                    name="password"
                                    type="password"
                                    placeholder=""
                                    form={form as Record<string, string>}
                                    onChange={onChange}
                                    error={errors.password}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || hasErrors}
                            >
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>

                        </div>

                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/sign-up" className="underline underline-offset-4">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
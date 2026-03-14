"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface QuestionData {
    solution?: number | string;
}

interface SubmitResult {
    success: boolean;
    error?: string;
}

export interface HeartChallenge {
    img: string;
    answer: number;
}

function validateAnswer(correctAnswer: QuestionData, answer: string): SubmitResult {
    if (!answer.trim()) {
        return { success: false, error: "Please enter the answer" };
    }

    const _answer = Number(answer);

    if (Number.isNaN(_answer)) {
        return { success: false, error: "Answer must be a number" };
    }

    const solution = correctAnswer !== undefined
        ? Number(correctAnswer)
        : null;

    if (solution === null) {
        return { success: false, error: "Question data is missing" };
    }

    if (_answer !== solution) {
        return { success: false, error: "Wrong answer. Please try again" };
    }

    return { success: true };
}

async function saveAction(): Promise<SubmitResult> {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
        data: { heart_question_solved: true },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    const cookieStore = await cookies();
    cookieStore.set("heart_question_solved", "true", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return { success: true };
}

export async function handleSubmitAction(
    correctAnswer: QuestionData,
    answer: string
): Promise<SubmitResult> {
    const validation = validateAnswer(correctAnswer, answer);
    if (!validation.success) return validation;

    const result = await saveAction();
    if (!result.success) {
        return { success: false, error: result.error ?? "Verification failed" };
    }

    return { success: true };
}


export async function getHeartQuestionAction(): Promise<{ success: boolean; data?: HeartChallenge; error?: string }> {
    try {
        const res = await fetch("https://marcconrad.com/uob/heart/api.php", { cache: "no-store" });
        if (!res.ok) return { success: false, error: "Failed to fetch challenge" };
        const data = await res.json();
        return { success: true, data: { img: data.question, answer: data.solution } };
    } catch {
        return { success: false, error: "Network error" };
    }
}
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCallApi } from "@/hooks/useCallApi";
import { getHeartQuestionAction, handleSubmitAction } from "./actions";
import MessageBox from "@/components/common/MessageBox";
import { useServerAction } from "@/hooks/useServerAction";

const HeartQuestionHumanPage: React.FC = () => {
    const router = useRouter();

    const { data, error, loading: loading, refresh }: any = useServerAction(getHeartQuestionAction)

    const [answer, setAnswer] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    const question = data?.img || "";
    const correctAnswer = data?.answer || "";

    const handleRefresh = () => {
        setAnswer("");
        setImgLoaded(false);
        refresh();
    };

    const handleSubmit = async () => {
        if (!data) return;
        setIsSubmitting(true);

        const result = await handleSubmitAction(correctAnswer, answer);

        if (!result.success) {
            toast.warning(result.error);
            // Refresh question if answer was wrong
            if (result.error === "Wrong answer. Please try again") handleRefresh();
            setIsSubmitting(false);
            return;
        }

        toast.success("Your answer is correct");
        router.push("/app");
    };

    if (loading) {
        return (
            <div className="flex items-center w-full h-full justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-xl text-center font-semibold mb-2">
                Before you navigate the game, you must solve this.
            </h1>
            <p className="text-center">
                Count the hearts in the picture and enter the number below.
            </p>

            {error && <MessageBox type="error" message={error} />}

            {data && typeof data === "object" && (
                <div className="space-y-3">
                    {Boolean(question) && (
                        <div className="relative w-full">
                            {!imgLoaded && (
                                <div className="w-full h-[50vh] rounded bg-gray-800 animate-pulse flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                </div>
                            )}
                            <img
                                src={question}
                                alt="question"
                                onLoad={() => setImgLoaded(true)}
                                className={`max-w-full h-auto rounded transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0 absolute top-0 left-0"
                                    }`}
                            />
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                        <label className="sr-only">Answer</label>
                        <input
                            value={answer}
                            type="number"
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter the number of hearts in the picture"
                            className="px-3 py-2 border rounded"
                            inputMode="numeric"
                            disabled={!imgLoaded || isSubmitting}
                        />
                        <Button
                            className="px-3 py-2 bg-green-600 hover:bg-green-800 text-white rounded"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !answer || !imgLoaded}
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                        </Button>
                        <Button
                            className="px-3 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded"
                            onClick={handleRefresh}
                            disabled={isSubmitting}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeartQuestionHumanPage;
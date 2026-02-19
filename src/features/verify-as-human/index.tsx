
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCallApi } from "../../hooks/useCallApi";
import MessageBox from "@/src/common/MessageBox";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const VerifyASHumanPage: React.FC = () => {
    const router = useRouter();
    const { data, error, loading, refresh } = useCallApi('/api/get-heart-game-data');
    const [answer, setAnswer] = useState<string>("");
    const [shoutVisible, setShoutVisible] = useState(false);

    const question = data?.question || ''

    const doShout = (text: string) => {
        try {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'en-US';
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
        } catch (e) {
            // ignore if not supported
        }
        setShoutVisible(true);
        setTimeout(() => setShoutVisible(false), 1500);
    };

    const handleSubmit = () => {
        const solution = (data && typeof data === 'object' && (data as any).solution !== undefined) ? Number((data as any).solution) : null;
        const _answer = +answer;

        if (solution !== null && !Number.isNaN(_answer) && _answer === solution) {
            toast.success('Verified Sucsussfully')
            router.push('/protected/dashboard')
        } else {
            toast.warning('Wrong Answer. Please try again')
            refresh()
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl text-center font-semibold mb-2">Verify As Human</h1>
            <p className=" text-center">Count the hearts in the picture and enter the number below.</p>
            {
                error && <MessageBox type={"error"} message={error} />
            }

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {data && typeof data === 'object' && (
                <div className="space-y-3">
                    {Boolean(question) && (
                        <div>
                            <img src={question} alt="question" className="max-w-full h-auto rounded" />
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 items-center justify-center ">
                        <label className="sr-only">Answer</label>
                        <input
                            value={answer}
                            type="number"
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter the number of hearts in the picture"
                            className="px-3 py-2 border rounded"
                            inputMode="numeric"
                        />
                        <Button className="px-3 py-2 bg-green-600 hover:bg-green-800 text-white rounded"
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                        <Button
                            className="px-3 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded"
                            onClick={() => { setAnswer(''); refresh(); }}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyASHumanPage;

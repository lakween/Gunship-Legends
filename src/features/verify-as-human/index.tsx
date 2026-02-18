
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCallApi } from "../../hooks/useCallApi";
import MessageBox from "@/src/common/MessageBox";

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

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const solution = (data && typeof data === 'object' && (data as any).solution !== undefined) ? Number((data as any).solution) : null;
        const _answer = +answer;

        if (solution !== null && !Number.isNaN(_answer) && _answer === solution) {
            doShout('Correct! Well done — redirecting now.');
            setTimeout(() => router.push('/app/abc/page'), 800);
        } else {
            doShout('Nope — try again!');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-2">Verify As Human</h1>
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

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <label className="sr-only">Answer</label>
                        <input
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter the number of hearts in the picture"
                            className="px-3 py-2 border rounded"
                            inputMode="numeric"
                        />
                        <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Submit</button>
                        <button type="button" onClick={() => { setAnswer(''); refresh(); }} className="px-3 py-2 bg-gray-200 rounded">Refresh</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default VerifyASHumanPage;

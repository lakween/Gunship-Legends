"use client";

import React from "react";
import { useHeartData } from "../../hooks/useHeartData";

const VerifyASHumanPage: React.FC = () => {
    const { data, error, loading, refresh } = useHeartData();

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-2">Verify As Human</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {data && (
                <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{typeof data === "string" ? data : JSON.stringify(data, null, 2)}</pre>
            )}
            <button onClick={refresh} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">
                Refresh
            </button>
        </div>
    );
};

export default VerifyASHumanPage;

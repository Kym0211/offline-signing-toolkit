"use client";

import { useState } from "react";
import { ConstructTx } from "./ConstructTx";
// 1. Uncomment the QR code import
import { QrCodeDisplay } from "./QrCodeDisplay"; 

export function OnlineTool() {
    const [transactionMessage, setTransactionMessage] = useState<string | null>(null);
    console.log("transactionMessage: ", transactionMessage);

    if (transactionMessage) {
        return (
            <div className="space-y-4">
                <h2 className="text-center text-lg font-medium">
                    Scan with your Offline Signer
                </h2>
                
                {/* 2. Use the new component */}
                <QrCodeDisplay message={transactionMessage} />

                <button 
                    onClick={() => setTransactionMessage(null)}
                    className="w-full rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                    Create Another
                </button>
            </div>
        );
    }

    return (
        <ConstructTx onMessageCreated={setTransactionMessage} />
    );
}
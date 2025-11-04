"use client";

import { useState } from "react";
import { solTransfer } from "@/lib/sol_transfer"; // Import our logic

// This component tells the parent when a message is created
interface ConstructTxProps {
    onMessageCreated: (message: string) => void;
}

export function ConstructTx({ onMessageCreated }: ConstructTxProps) {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [nonce, setNonce] = useState("");
    const [sender, setSender] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        // console.log("setting transaction");
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const message = await solTransfer(sender, +amount, nonce, recipient);
            console.log(message);
            
            // Pass the signed message up to the parent component
            onMessageCreated(message);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="recipient" className="block text-sm font-medium">
                    Recipient Address
                </label>
                <input
                    type="text"
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black p-2"
                    placeholder="Enter recipient public key"
                />
            </div>
            <div>
                <label htmlFor="amount" className="block text-sm font-medium">
                    Amount (SOL)
                </label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0.000000001"
                    step="any"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black p-2"
                    placeholder="0.1"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isLoading ? "Creating..." : "Create Transaction"}
            </button>

            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
}
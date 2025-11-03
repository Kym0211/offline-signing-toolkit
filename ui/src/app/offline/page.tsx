"use client";

import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { signMessageOffline } from "@/lib/solana-offline";
import { QrCodeDisplay } from "@/components/QrCodeDisplay";

// This type defines the JSON object we'll show in the signature QR code
type SignatureData = {
    signature: string;
    publicKey: string;
};

export default function OfflinePage() {
    // We manage the user's flow with a simple state machine
    const [step, setStep] = useState<"scan" | "sign" | "display">("scan");
    
    const [scannedMessage, setScannedMessage] = useState<string | null>(null);
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
    
    const [keypairFile, setKeypairFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Handle the QR code scan result
    const handleScan = (result: any, error: any) => {
        if (!!result) {
            setScannedMessage(result.text);
            setStep("sign");
        }
        if (!!error) {
            console.info(error);
        }
    };

    // 2. Handle the file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setKeypairFile(e.target.files[0]);
        }
    };

    // 3. Handle the signing process
    const handleSign = async () => {
        if (!scannedMessage || !keypairFile) {
            setError("Missing transaction message or keypair file.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Read the file content as text
            const keypairFileContent = await keypairFile.text();
            
            // Call our offline signing logic
            const { signature, publicKey } = signMessageOffline(scannedMessage, keypairFileContent);
            
            setSignatureData({ signature, publicKey });
            setStep("display");

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
            <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-xl">
                <h1 className="mb-6 text-center text-2xl font-bold">
                    Offline Signer
                </h1>

                {/* STEP 1: SCAN QR CODE */}
                {step === "scan" && (
                    <div className="space-y-4">
                        <h2 className="text-center text-lg">Scan Transaction QR Code</h2>
                        <QrReader
                            onResult={handleScan}
                            constraints={{ facingMode: "environment" }}
                            containerStyle={{ width: "100%" }}
                        />
                        <p className="text-center text-sm text-gray-400">
                            Point your camera at the QR code displayed on your online machine.
                        </p>
                    </div>
                )}

                {/* STEP 2: SIGN MESSAGE */}
                {step === "sign" && (
                    <div className="space-y-4">
                        <h2 className="text-center text-lg">Transaction Loaded</h2>
                        <p className="text-sm text-green-400">
                            ✅ Transaction message loaded successfully.
                        </p>
                        
                        <div>
                            <label className="block text-sm font-medium">
                                Upload Your Cold Wallet (JSON)
                            </label>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-300
                                           file:mr-4 file:rounded-md file:border-0
                                           file:bg-blue-600 file:px-4 file:py-2
                                           file:text-sm file:font-semibold file:text-white
                                           hover:file:bg-blue-700"
                            />
                        </div>
                        
                        <button
                            onClick={handleSign}
                            disabled={!keypairFile || isLoading}
                            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isLoading ? "Signing..." : "Sign Transaction"}
                        </button>
                        
                        {error && <p className="text-red-500">{error}</p>}
                    </div>
                )}

                {/* STEP 3: DISPLAY SIGNATURE */}
                {step === "display" && signatureData && (
                    <div className="space-y-4">
                        <h2 className="text-center text-lg">Scan Signature</h2>
                        <QrCodeDisplay message={JSON.stringify(signatureData)} />
                        <p className="text-center text-sm text-gray-400">
                            Scan this with your online machine to broadcast.
                        </p>
                        <button
                            onClick={() => setStep("scan")}
                            className="w-full rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            Sign Another
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
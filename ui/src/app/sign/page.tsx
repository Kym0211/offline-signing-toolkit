"use client";
import { useState } from "react";
import { signMessageOffline } from "@/lib/sign"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react"; 
import { useRouter } from "next/navigation";


const downloadJson = (content: string, fileName: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: "application/json" });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
};

type SignatureData = {
    signature: string;
    publicKey: string;
};

export default function OfflinePage() {

    const router = useRouter();

    const [unsignedTxFile, setUnsignedTxFile] = useState<File | null>(null);
    const [keypairFile, setKeypairFile] = useState<File | null>(null);


    const [step, setStep] = useState<"upload" | "display">("upload");
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleTxFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUnsignedTxFile(e.target.files[0]);
            setError(null); 
        }
    };

    const handleKeypairFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setKeypairFile(e.target.files[0]);
            setError(null); 
        }
    };

    const handleSign = async () => {
        if (!unsignedTxFile || !keypairFile) {
            setError("Please upload both files.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { signature, publicKey } = await signMessageOffline(
                unsignedTxFile, 
                keypairFile
            );
            
            setSignatureData({ signature, publicKey });
            setStep("display"); 

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
            router.replace('/broadcast');
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 text-white">
            <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-xl">
                <h1 className="mb-6 text-center text-2xl font-bold">
                    Offline Signer
                </h1>

                {step === "upload" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tx-file">1. Upload Unsigned Transaction</Label>
                            <Input
                                id="tx-file"
                                type="file"
                                accept=".json"
                                onChange={handleTxFileUpload}
                                className="file:mr-4 file:rounded-md file:border-0 file:bg-gray-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="keypair-file">2. Upload Cold Wallet File</Label>
                            <Input
                                id="keypair-file"
                                type="file"
                                accept=".json"
                                onChange={handleKeypairFileChange}
                                className="file:mr-4 file:rounded-md file:border-0 file:bg-gray-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                            />
                        </div>
                        
                        <Button
                            onClick={handleSign}
                            disabled={!unsignedTxFile || !keypairFile || isLoading}
                            className="w-full"
                        >
                            {isLoading ? "Signing..." : "Sign Transaction"}
                        </Button>
                        
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                )}

                {step === "display" && signatureData && (
                    <div className="space-y-4">
                        <h2 className="text-center text-lg">Signature Generated</h2>
                        <p className="text-center text-sm text-gray-400">
                            Your transaction is signed. Download the signature file and move it back to your online machine.
                        </p>
                        
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => downloadJson(JSON.stringify(signatureData, null, 2), "signature.json")}
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Download Signature File
                        </Button>

                        <Button
                            onClick={() => {
                                setStep("upload");
                                setUnsignedTxFile(null);
                                setKeypairFile(null);
                                setSignatureData(null);
                            }}
                            className="w-full"
                            variant="outline"
                        >
                            Sign Another
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
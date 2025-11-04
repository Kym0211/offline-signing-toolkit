"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle, AlertCircle, Rocket } from "lucide-react";

// 1. Import our new browser-safe function
import { broadcastTransaction } from "@/lib/broadcast";

export default function BroadcastPage() {
    const [unsignedTxFile, setUnsignedTxFile] = useState<File | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txSignature, setTxSignature] = useState<string | null>(null);

    const handleBroadcast = async () => {
        if (!unsignedTxFile || !signatureFile) {
            setError("Please upload both the unsigned transaction and the signature file.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setTxSignature(null);

        try {
            // 2. Call our new browser-safe function
            const sig = await broadcastTransaction(unsignedTxFile, signatureFile);
            
            setTxSignature(sig); // Success!

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during broadcast.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Broadcast Transaction</CardTitle>
                    <CardDescription>
                        Upload your unsigned transaction file and the generated signature file to send.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* The main form */}
                    {!txSignature && (
                        <form onSubmit={(e) => { e.preventDefault(); handleBroadcast(); }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="unsigned-tx-file">1. Unsigned Transaction File</Label>
                                <Input
                                    id="unsigned-tx-file"
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => setUnsignedTxFile(e.target.files?.[0] || null)}
                                    className="file:mr-4 file:rounded-md file:border-0 file:bg-gray-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signature-file">2. Signature File</Label>
                                <Input
                                    id="signature-file"
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                                    className="file:mr-4 file:rounded-md file:border-0 file:bg-gray-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-600"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={!unsignedTxFile || !signatureFile || isLoading}
                            >
                                <Rocket className="mr-2 h-5 w-5" />
                                {isLoading ? "Broadcasting..." : "Broadcast Transaction"}
                            </Button>
                        </form>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 flex items-center rounded-md border border-red-500 bg-red-900/20 p-3 text-red-300">
                            <AlertCircle className="mr-2 h-5 w-5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {txSignature && (
                        <div className="mt-4 space-y-4 text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <h3 className="text-lg font-medium text-white">Transaction Sent!</h3>
                            <p className="text-sm text-gray-400">Your transaction has been successfully broadcast to the network.</p>
                            
                            <Button asChild variant="link" className="text-blue-400">
                                <Link 
                                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} 
                                    target="_blank"
                                >
                                    View on Explorer
                                </Link>
                            </Button>

                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => {
                                    setTxSignature(null);
                                    setError(null);
                                    setUnsignedTxFile(null);
                                    setSignatureFile(null);
                                }}
                            >
                                Send Another
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
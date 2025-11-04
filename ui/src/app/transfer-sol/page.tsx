"use client";
import { useState } from "react";
import FormCard, { type FormData } from "@/components/FormCard";
import { solTransfer } from "@/lib/sol_transfer"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function TransferSolPage() {
    const router = useRouter();
    const [unsignedTxData, setUnsignedTxData] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFormSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const msg = await solTransfer(
                data.senderAddress,
                parseFloat(data.amount),
                data.noncePubkey,
                data.recipientAddress,
            );
            
            const fileContent = JSON.stringify({ message: msg }, null, 2);
            
            setUnsignedTxData(fileContent);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
            router.replace('/offline');
        }
    };

    if (unsignedTxData) {
        return (
            <div className="flex w-full items-center justify-center py-12">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Transaction Created</CardTitle>
                        <CardDescription>
                            Your unsigned transaction is ready. Download it and move it to your offline device.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => downloadJson(unsignedTxData, "unsigned-tx.json")}
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Download Transaction File
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setUnsignedTxData(null)} 
                        >
                            Create Another Transaction
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            <FormCard
                onFormSubmit={handleFormSubmit}
                isLoading={isLoading}
                externalError={error}
            />
        </div>
    );
}
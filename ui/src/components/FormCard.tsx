"use client";

import type React from "react";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define a type for our error state
type FormErrors = {
  senderAddress?: string;
  recipientAddress?: string;
  noncePubkey?: string;
};

// Export the form data type
export type FormData = {
    senderAddress: string;
    recipientAddress: string;
    noncePubkey: string;
    amount: string;
};

// Define props for the component
interface FormCardProps {
    isLoading: boolean;
    externalError: string | null;
    onFormSubmit: (data: FormData) => void; // Callback function
}

export default function FormCard({ isLoading, externalError, onFormSubmit }: FormCardProps) {
  const [formData, setFormData] = useState<FormData>({
    senderAddress: "",
    recipientAddress: "",
    noncePubkey: "",
    amount: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    try { new PublicKey(formData.senderAddress); } catch (e) { newErrors.senderAddress = "Invalid public key"; }
    try { new PublicKey(formData.recipientAddress); } catch (e) { newErrors.recipientAddress = "Invalid public key"; }
    try { new PublicKey(formData.noncePubkey); } catch (e) { newErrors.noncePubkey = "Invalid public key"; }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Call the parent function with the valid data
    onFormSubmit(formData);
  };

  return (
    // Note: The min-h-screen and layout classes are REMOVED.
    // The parent page now handles layout.
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Transfer Sol</CardTitle>
        <CardDescription>Please fill out all fields below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sender Address (Cold Wallet) */}
          <div className="space-y-2">
            <Label htmlFor="senderAddress">Sender Address (Cold Wallet)</Label>
            <Input
              id="senderAddress"
              name="senderAddress"
              type="text"
              placeholder="Enter sender's publickey"
              value={formData.senderAddress}
              onChange={handleChange}
              required
            />
            {errors.senderAddress && (
              <p className="text-sm text-red-500">{errors.senderAddress}</p>
            )}
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipientAddress">Recipient Address</Label>
            <Input
              id="recipientAddress"
              name="recipientAddress"
              type="text"
              placeholder="Enter recipient's publickey"
              value={formData.recipientAddress}
              onChange={handleChange}
              required
            />
            {errors.recipientAddress && (
              <p className="text-sm text-red-500">{errors.recipientAddress}</p>
            )}
          </div>

          {/* Nonce Pubkey */}
          <div className="space-y-2">
            <Label htmlFor="noncePubkey">Nonce Pubkey</Label>
            <Input
              id="noncePubkey"
              name="noncePubkey"
              type="text"
              placeholder="Enter your nonce account pubkey"
              value={formData.noncePubkey}
              onChange={handleChange}
              required
            />
            {errors.noncePubkey && (
              <p className="text-sm text-red-500">{errors.noncePubkey}</p>
            )}
          </div>


          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SOL)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="0.1"
              value={formData.amount}
              onChange={handleChange}
              min="0.000000001"
              step="any"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Transaction..." : "Create Transaction"}
          </Button>
          
          {externalError && (
            <p className="text-sm text-red-500">{externalError}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
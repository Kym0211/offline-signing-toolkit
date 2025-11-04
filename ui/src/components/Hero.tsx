"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    // We have padding (py-20) and no flex-1
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-extrabold text-white">
        Secure Your Assets.
        <br />
        <span className="text-blue-400">Make Your Transactions Offline.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-gray-400">
        Use an air-gapped device to sign your most important transactions.
        No internet, no risk. Get started by creating a new transaction.
      </p>
      <div className="mt-10 flex gap-4">
        <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/transfer-sol">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/offline">Open Offline Signer</Link>
        </Button>
      </div>
    </div>
  );
}
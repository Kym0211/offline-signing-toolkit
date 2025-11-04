import { FilePenLine, ShieldOff, Send } from "lucide-react";

export function Instructions() {
  return (
    <section className="w-full bg-gray-900/50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-400">
            A simple, secure, 3-step process to protect your assets.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-12 sm:mt-20 lg:max-w-none lg:grid-cols-3">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-y-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <FilePenLine className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              1. Construct
            </h3>
            <p className="text-gray-400">
              Go to the 'Transfer Sol' page and fill in your transaction details.
              A secure QR code will be generated.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-y-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <ShieldOff className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              2. Sign Offline
            </h3>
            <p className="text-gray-400">
              Open the downloaded 'Offline' app on an air-gapped device.
              Scan the QR code, sign with your private key, and get a signature QR.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-y-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <Send className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              3. Broadcast
            </h3>
            <p className="text-gray-400">
              Return to the online app and scan the signature QR code.
              We'll securely broadcast your signed transaction to the network.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
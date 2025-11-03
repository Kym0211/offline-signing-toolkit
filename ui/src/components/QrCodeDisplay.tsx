"use client";

import { QRCodeCanvas } from "qrcode.react";

interface QrCodeDisplayProps {
    message: string;
}

export function QrCodeDisplay({ message }: QrCodeDisplayProps) {
    return (
        <div className="flex justify-center rounded-lg bg-white p-4">
            <QRCodeCanvas
                value={message}
                size={256} // The size of the QR code in pixels
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"} // Error correction level
            />
        </div>
    );
}
import React, { useEffect, useRef, useState } from 'react';
import Quagga from "@ericblade/quagga2";

export function BarcodeScanner({ onScan, onError }) {
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (!isScanning) {
            return;
        }

        Quagga.init(
            {
                inputStream: {
                    name: 'Live',
                    type: 'LiveStream',
                    target: scannerRef.current,
                    constraints: {
                        facingMode: 'environment',
                    },
                },
                decoder: {
                    readers: ['code_128_reader', 'ean_reader', 'upc_reader'],
                },
            },
            (err) => {
                if (err) {
                    console.error(err);
                    if (onError) onError(err);
                    return;
                }
                Quagga.start();
            }
        );

        Quagga.onDetected((result) => {
            if (result && result.codeResult && result.codeResult.code) {
                onScan(result.codeResult.code);
                Quagga.stop();
                setIsScanning(false);
            }
        });

        return () => {
            Quagga.stop();
        };
    }, [isScanning, onScan, onError]);

    return (
        <div className="space-y-4">
            <button
                className={`px-4 py-2 rounded text-white ${isScanning ? 'bg-red-500' : 'bg-green-600'}`}
                onClick={() => setIsScanning((prev) => !prev)}
            >
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </button>

            {isScanning && (
                <div ref={scannerRef} className="w-full h-80 border border-gray-300 rounded-md overflow-hidden" />
            )}
        </div>
    );
}

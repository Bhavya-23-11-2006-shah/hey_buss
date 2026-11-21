import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface TicketQRCodeProps {
  data: string;
}

export const TicketQRCode: React.FC<TicketQRCodeProps> = ({ data }) => {
  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(data, {
      width: 180,
      margin: 1,
      color: {
        dark: '#121212',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrSrc(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [data]);

  if (!qrSrc) {
    return (
      <div className="w-36 h-36 bg-neutral-100 border-2 border-dashed border-ink flex items-center justify-center font-mono text-xs">
        Generating QR...
      </div>
    );
  }

  return (
    <div className="p-2 bg-white border-2 border-ink rounded shadow-hard-sm inline-block">
      <img
        src={qrSrc}
        alt={`Transit Boarding QR Code for Booking ${data}`}
        className="w-36 h-36 mx-auto block"
      />
      <div className="text-center font-mono text-[11px] font-bold text-ink mt-1">
        SCAN FOR CONDUCTOR
      </div>
    </div>
  );
};

export default TicketQRCode;

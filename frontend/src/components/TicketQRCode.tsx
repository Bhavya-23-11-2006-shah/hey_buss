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
        dark: '#0B1330',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrSrc(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [data]);

  if (!qrSrc) {
    return (
      <div className="w-36 h-36 bg-neutral-100 border border-dashed border-neutral-300 rounded flex items-center justify-center font-mono text-xs text-muted">
        Generating QR...
      </div>
    );
  }

  return (
    <div className="p-2 bg-white border border-neutral-300 rounded-btn shadow-sm inline-block text-center">
      <img
        src={qrSrc}
        alt={`Transit Boarding QR Code for Booking ${data}`}
        className="w-36 h-36 mx-auto block"
      />
      <div className="text-center font-mono text-[10px] font-bold text-muted mt-1 uppercase tracking-wider">
        Scan for Conductor Verification
      </div>
    </div>
  );
};

export default TicketQRCode;

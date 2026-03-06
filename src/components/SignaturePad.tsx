import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './Button';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    onClear?.();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) return;
    const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataURL) {
      onSave(dataURL);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border-2 border-dashed border-zinc-300 rounded-lg bg-white overflow-hidden">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: 'w-full h-48 cursor-crosshair',
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={clear} className="flex-1">
          Limpar
        </Button>
        <Button onClick={save} className="flex-1">
          Confirmar Assinatura
        </Button>
      </div>
    </div>
  );
};

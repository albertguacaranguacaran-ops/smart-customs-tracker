import React, { useState } from 'react';
import { UploadCloud, File, Check, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
    onUploadSuccess?: (fileName: string) => void;
}

export function DocumentUploader({ onUploadSuccess }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'UPLOADING' | 'DONE'>('IDLE');

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setUploadStatus('UPLOADING');

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('files', file);
            });

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    setUploadStatus('DONE');

                    // CRITICAL: Notify Dashboard to create container in Firestore
                    if (onUploadSuccess && files.length > 0) {
                        onUploadSuccess(files[0].name);
                    }

                    setTimeout(() => setUploadStatus('IDLE'), 3000);
                } else {
                    console.error("Upload failed");
                    setUploadStatus('IDLE');
                    alert("Error: No se pudo conectar a la ruta de red. Verifique permisos.");
                }
            } catch (error) {
                console.error(error);
                setUploadStatus('IDLE');
            }
        }
    };

    return (
        <div
            className={clsx(
                "fixed bottom-6 right-6 w-80 bg-slate-800 rounded-xl shadow-2xl border transition-all duration-200 overflow-hidden cursor-pointer",
                isDragging ? "border-blue-500 scale-105 bg-slate-700" : "border-slate-700",
                uploadStatus === 'DONE' && "border-green-500"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="p-6 flex flex-col items-center text-center">
                {uploadStatus === 'IDLE' && (
                    <>
                        <div className="bg-slate-900 p-3 rounded-full mb-3">
                            <UploadCloud className="w-6 h-6 text-blue-400" />
                        </div>
                        <h4 className="text-white font-medium text-sm">Carga Rápida de Documentos</h4>
                        <p className="text-slate-500 text-xs mt-1">Arrastra aquí Facturas o BLs. Se guardarán en Local y SharePoint.</p>
                    </>
                )}

                {uploadStatus === 'UPLOADING' && (
                    <>
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                        <p className="text-slate-300 text-sm">Sincronizando con SharePoint...</p>
                    </>
                )}

                {uploadStatus === 'DONE' && (
                    <>
                        <div className="bg-green-500/20 p-3 rounded-full mb-2">
                            <Check className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-green-400 text-sm font-medium">¡Guardado Exitoso!</p>
                        <p className="text-slate-500 text-xs text-center mt-1">Archivo disponible en:<br />\\SRV-LOGISTICA\Docs\2024</p>
                    </>
                )}
            </div>

            {/* Progress Bar Mockup */}
            {uploadStatus === 'UPLOADING' && (
                <div className="h-1 w-full bg-slate-900">
                    <div className="h-full bg-blue-500 animate-[width_2s_ease-in-out_forwards] w-full origin-left"></div>
                </div>
            )}
        </div>
    );
}

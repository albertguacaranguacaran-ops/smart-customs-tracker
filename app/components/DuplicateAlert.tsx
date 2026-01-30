'use client';
import React from 'react';
import { AlertTriangle, X, FileWarning, Copy } from 'lucide-react';

interface DuplicateAlertProps {
    isOpen: boolean;
    onClose: () => void;
    duplicateInfo: {
        containerNumber: string;
        existingStatus: string;
        existingSupplier: string;
    } | null;
}

export function DuplicateAlertModal({ isOpen, onClose, duplicateInfo }: DuplicateAlertProps) {
    if (!isOpen || !duplicateInfo) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 w-full max-w-md rounded-xl border border-red-500/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <FileWarning className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-white font-bold text-lg">Documento Duplicado</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start space-x-4 mb-6">
                        <div className="bg-red-500/10 p-3 rounded-full shrink-0">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <p className="text-white font-medium mb-2">
                                Este documento ya existe en el sistema
                            </p>
                            <p className="text-slate-400 text-sm">
                                No se pueden registrar documentos duplicados para mantener la integridad de los datos.
                            </p>
                        </div>
                    </div>

                    {/* Duplicate Details Card */}
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 mb-6">
                        <div className="flex items-center space-x-2 mb-3">
                            <Copy className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm font-medium">Registro Existente</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">ID Contenedor:</span>
                                <span className="text-white font-mono text-sm">{duplicateInfo.containerNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">Estado Actual:</span>
                                <span className="text-yellow-400 text-sm font-medium">{duplicateInfo.existingStatus}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">Proveedor:</span>
                                <span className="text-slate-300 text-sm">{duplicateInfo.existingSupplier}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <span>Entendido</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="bg-slate-800/30 px-6 py-3 border-t border-slate-800">
                    <p className="text-slate-500 text-xs text-center">
                        💡 Si necesita actualizar este documento, edite el registro existente desde el tablero.
                    </p>
                </div>
            </div>
        </div>
    );
}

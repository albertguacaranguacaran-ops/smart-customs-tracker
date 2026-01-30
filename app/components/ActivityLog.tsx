'use client';

import React, { useState } from 'react';
import { Container } from '../types';
import { Send, User, Bot, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
    containerNumber: string;
    onClose: () => void;
}

// Mock Data for Demo
const MOCK_MESSAGES = [
    { id: '1', user: 'System', role: 'SYSTEM', message: 'Contenedor creado automáticamente desde BL upload.', timestamp: '2024-10-24 09:30 AM' },
    { id: '2', user: 'Ana (Analista)', role: 'ANALYST', message: 'Se detectó error en el peso del Packing List. Contactando proveedor.', timestamp: '2024-10-24 10:15 AM' },
    { id: '3', user: 'Carlos (Gerente)', role: 'MANAGER', message: 'Ok, procedan con la corrección en origen antes de que llegue a puerto.', timestamp: '2024-10-24 10:45 AM' },
    { id: '4', user: 'Ana (Analista)', role: 'ANALYST', message: 'Proveedor confirmó corrección. Nuevo BL recibido.', timestamp: '2024-10-25 08:00 AM' },
];

export function ActivityLogModal({ containerNumber, onClose }: Props) {
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = {
            id: Date.now().toString(),
            user: 'Tú (Gerente)',
            role: 'MANAGER',
            message: newMessage,
            timestamp: new Date().toLocaleString('es-VE', { hour12: true })
        };

        // @ts-ignore
        setMessages([...messages, msg]);
        setNewMessage('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">

                {/* Header */}
                <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-white font-bold">Bitácora de Equipo</h3>
                        <p className="text-xs text-slate-400">Contenedor: {containerNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={clsx("flex flex-col", msg.role === 'MANAGER' ? "items-end" : "items-start")}>
                            <div className="flex items-center space-x-2 mb-1">
                                {msg.role === 'SYSTEM' && <Bot className="w-3 h-3 text-slate-400" />}
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{msg.user}</span>
                                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                            </div>
                            <div className={clsx(
                                "max-w-[85%] p-3 rounded-xl text-sm shadow-sm",
                                msg.role === 'MANAGER' ? "bg-blue-600 text-white rounded-tr-none" :
                                    msg.role === 'SYSTEM' ? "bg-slate-200 text-slate-600 w-full text-center italic" :
                                        "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                            )}>
                                {msg.message}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un comentario..."
                        className="flex-1 bg-slate-100 text-slate-900 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}

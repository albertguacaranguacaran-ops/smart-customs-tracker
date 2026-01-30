'use client';
import React, { useState, useEffect } from 'react';
import { Container, ColumnDefinition } from '../types';
import { ContainerCard } from './ContainerCard';
import { DocumentUploader } from './DocumentUploader';
import { DuplicateAlertModal } from './DuplicateAlert';
import { Search, Ship, Anchor, FileText, Package, AlertTriangle, Filter, Download, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { subscribeToContainers, addContainer } from '../lib/containerService';

// Initial seed data (only used if Firestore is empty)
const SEED_DATA: Omit<Container, 'id'>[] = [
    { containerNumber: 'HLBU-1234567', supplier: 'TextileGlobe Solutions', textileType: 'Tela Algodón', containerSize: '40HQ', weight: '24,500 Kg', status: 'TRANSIT', sencamerStatus: 'VALID', departureDate: '10 Sep 2024', eta: '25 Oct 2024', vessel: 'MSC Zoe' },
    { containerNumber: 'COSU-9876543', supplier: 'SilkRoad Fabrics', textileType: 'Seda Natural', containerSize: '20GP', weight: '18,200 Kg', status: 'TRANSIT', sencamerStatus: 'VALID', departureDate: '12 Sep 2024', eta: '01 Nov 2024', vessel: 'CMA CGM Marco Polo' },
    { containerNumber: 'MSCU-4567890', supplier: 'DenimWorld', textileType: 'Mezclilla Pesada', containerSize: '40HQ', weight: '26,000 Kg', status: 'PORT', sencamerStatus: 'PROCESSING', vessel: 'MSC Zoe', departureDate: '01 Sep 2024', arrivalDate: '15 Oct 2024' },
    { containerNumber: 'OOCL-9988776', supplier: 'GlobalLinen', textileType: 'Lino Premium', containerSize: '40HQ', weight: '23,400 Kg', status: 'CUSTOMS', sencamerStatus: 'EXPIRED', vessel: 'OOCL Hong Kong', departureDate: '15 Aug 2024', arrivalDate: '25 Sep 2024' },
];

const COLUMNS: ColumnDefinition[] = [
    { id: 'TRANSIT', title: 'Tránsito Internacional', color: 'border-blue-500' },
    { id: 'PORT', title: 'Llegada a Puerto', color: 'border-yellow-500' },
    { id: 'CUSTOMS', title: 'Aduana / SENCAMER', color: 'border-orange-500' },
    { id: 'WAREHOUSE', title: 'Liberado / En Almacén', color: 'border-green-500' },
];

export function Dashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showIssuesOnly, setShowIssuesOnly] = useState(false);
    const [containers, setContainers] = useState<Container[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for duplicate alert modal
    const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
    const [duplicateInfo, setDuplicateInfo] = useState<{
        containerNumber: string;
        existingStatus: string;
        existingSupplier: string;
    } | null>(null);

    // Subscribe to Firestore real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToContainers((data) => {
            setContainers(data);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleNewContainer = async (id: string) => {
        // Extract ID from filename
        const extractedId = id.match(/[A-Z]{4}-\d{7}/)?.[0] || id;

        // ⚠️ CHECK FOR DUPLICATES
        const existingContainer = containers.find(
            c => c.containerNumber === extractedId || c.containerNumber === id
        );

        if (existingContainer) {
            // DUPLICATE DETECTED - Show professional modal
            setDuplicateInfo({
                containerNumber: extractedId,
                existingStatus: existingContainer.status,
                existingSupplier: existingContainer.supplier
            });
            setShowDuplicateAlert(true);
            console.error('❌ Duplicate container rejected:', extractedId);
            return; // Stop execution - don't add duplicate
        }

        // SIMULATED OCR EXTRACTION LOGIC
        // In production, this would be the response from the AI Parser
        const mockScannedData = {
            supplier: Math.random() > 0.5 ? 'Global Textiles Ltd (China)' : 'Shanghai Fabrics Co.',
            type: Math.random() > 0.5 ? 'Mezclilla (Denim) 100% Algodón' : 'Poliéster Industrial',
            weight: Math.floor(Math.random() * (26000 - 18000) + 18000).toLocaleString('es-VE') + ' Kg',
            size: Math.random() > 0.3 ? '40HQ' : '20GP' as '20GP' | '40HQ',
            vessel: Math.random() > 0.5 ? 'MSC Oscar' : 'Ever Golden'
        };

        const newContainerData: Omit<Container, 'id'> = {
            containerNumber: extractedId,
            supplier: mockScannedData.supplier,
            textileType: mockScannedData.type,
            containerSize: mockScannedData.size,
            weight: mockScannedData.weight,
            status: 'TRANSIT',
            sencamerStatus: 'PROCESSING',
            departureDate: new Date().toLocaleDateString(),
            eta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            vessel: mockScannedData.vessel
        };

        // Save to Firestore (real-time subscription will update the UI automatically)
        try {
            await addContainer(newContainerData);
            console.log('✅ Container saved to Firestore:', extractedId);
        } catch (error) {
            console.error('❌ Error saving container:', error);
        }
    };

    const handleExportReport = () => {
        // Excel-friendly CSV Generation (Semicolon + BOM)
        // Updated Columns as per User Request
        const headers = ["ID Contenedor", "Tamaño", "Peso (Kg)", "Proveedor", "Tipo Textil", "Estatus", "SENCAMER", "Buque", "Fecha Salida", "Fecha Arribo/ETA"];
        const rows = containers.map(c => [
            c.containerNumber,
            c.containerSize || 'N/A',
            c.weight || 'N/A',
            c.supplier,
            c.textileType,
            c.status,
            c.sencamerStatus,
            c.vessel || 'N/A',
            c.departureDate || 'N/A',
            c.arrivalDate || c.eta || 'N/A'
        ]);

        // Use semicolon (;) for better compatibility with Spanish Excel
        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\n');

        // Add BOM so Excel recognizes UTF-8 correctly
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_detallado_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredData = containers.filter(c => {
        const matchesSearch = c.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.textileType.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesIssue = showIssuesOnly ? (c.sencamerStatus === 'EXPIRED' || c.sencamerStatus === 'WARNING' || new Date(c.eta || '') < new Date()) : true;

        return matchesSearch && matchesIssue;
    });

    const getKPIs = () => {
        // Calculate demurrage risk: containers with ETA in the past or within 3 days
        const today = new Date();
        const demurrageCount = containers.filter((c: Container) => {
            if (!c.eta) return false;
            const etaDate = new Date(c.eta);
            const diffDays = Math.ceil((etaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 3; // ETA within 3 days or overdue
        }).length;

        return {
            total: containers.length,
            inPort: containers.filter((c: Container) => c.status === 'PORT').length,
            sencamerIssues: containers.filter((c: Container) => c.sencamerStatus === 'EXPIRED' || c.sencamerStatus === 'WARNING').length,
            demurrageRisk: demurrageCount
        };
    };

    const kpis = getKPIs();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
            {/* Top Bar */}
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 rounded-xl p-2.5 shadow-lg shadow-purple-500/30 animate-pulse">
                        <span className="text-2xl">🐙</span>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        TRAFITDOSSIER <span className="text-xs font-normal text-slate-500 border border-slate-700 px-2 py-0.5 rounded ml-2">v1.0.0 PROTOTYPE</span>
                    </h1>
                </div>

                <div className="relative w-64">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar Container ID..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex space-x-3 items-center">
                    {/* Issues Filter Toggle */}
                    <button
                        onClick={() => setShowIssuesOnly(!showIssuesOnly)}
                        className={clsx(
                            "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all border",
                            showIssuesOnly
                                ? "bg-red-500/20 border-red-500 text-red-400"
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                        )}
                        title="Ver Solo Problemas"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Solo Problemas</span>
                    </button>

                    {/* Export Button */}
                    <button
                        onClick={handleExportReport}
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
                        title="Descargar Reporte Excel/CSV"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Exportar</span>
                    </button>

                    <div className="w-px h-8 bg-slate-700 mx-2"></div>

                    <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer border-2 border-slate-800 shadow-sm">
                        JD
                    </div>
                </div>
            </header>

            {/* KPI Row */}
            <section className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Contenedores</p>
                    <div className="text-3xl font-bold text-white">{kpis.total}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">En Puerto</p>
                            <div className="text-3xl font-bold text-yellow-400">{kpis.inPort}</div>
                        </div>
                        <Anchor className="w-5 h-5 text-yellow-500/50" />
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Retención SENCAMER</p>
                            <div className="text-3xl font-bold text-orange-400">{kpis.sencamerIssues}</div>
                        </div>
                        <FileText className="w-5 h-5 text-orange-500/50" />
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Alerta Demoras</p>
                            <div className="text-3xl font-bold text-red-500">{kpis.demurrageRisk}</div>
                        </div>
                        <div className="animate-pulse">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Kanban Board */}
            <section className="grid grid-cols-4 gap-6 h-[calc(100vh-280px)]">
                {COLUMNS.map(col => (
                    <div key={col.id} className="flex flex-col h-full">
                        <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${col.color}`}>
                            <h2 className="font-semibold text-slate-200">{col.title}</h2>
                            <span className="bg-slate-800 text-slate-400 text-xs py-0.5 px-2 rounded-full border border-slate-700">
                                {filteredData.filter(c => c.status === col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {filteredData
                                .filter(c => c.status === col.id)
                                .map(container => (
                                    <ContainerCard key={container.id} container={container} />
                                ))}

                            {filteredData.filter(c => c.status === col.id).length === 0 && (
                                <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg">
                                    <span className="text-slate-600 text-sm">No items</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </section>

            <DocumentUploader onUploadSuccess={handleNewContainer} />

            {/* Duplicate Alert Modal */}
            <DuplicateAlertModal
                isOpen={showDuplicateAlert}
                onClose={() => setShowDuplicateAlert(false)}
                duplicateInfo={duplicateInfo}
            />
        </div>
    );
}

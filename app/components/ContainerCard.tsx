import React, { useState } from 'react';
import { Container } from '../types';
import { Ship, Anchor, AlertTriangle, CheckCircle, Clock, Map, X, Loader2, MessageCircle, Truck, ArrowRight, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VerificationReportModal } from './VerificationReport';
import { VerificationReport } from '../types/verification';
import { ActivityLogModal } from './ActivityLog';

interface Props {
    container: Container;
    onStatusChange?: (containerId: string, newStatus: Container['status']) => void;
}

// Dynamic Error Generator for Antimultas Demo
// Generates realistic discrepancies based on container data
const generateVerificationReport = (container: Container): VerificationReport => {
    // Simulate document analysis - detect errors based on container data
    const discrepancies: VerificationReport['discrepancies'] = [];
    let errorCount = 0;

    // Check if container ID suggests test documents (COSU = has errors)
    const hasKnownErrors = container.containerNumber.includes('COSU') ||
        container.containerNumber.includes('01_BL');

    if (hasKnownErrors) {
        // Simulated errors matching our test documents
        discrepancies.push({
            id: '1',
            field: 'Nombre Consignatario',
            blValue: 'IMPORTADORA TEXTIL ORIENTE C.A.',
            invoiceValue: 'IMPORTADORA TEXTIL ORIENT C.A.',
            status: 'MISMATCH',
            severity: 'HIGH'
        });
        discrepancies.push({
            id: '2',
            field: 'Peso Bruto (Kg)',
            blValue: '43,950',
            invoiceValue: '44,200',
            status: 'MISMATCH',
            severity: 'HIGH'
        });
        discrepancies.push({
            id: '3',
            field: 'Cantidad Bultos',
            blValue: '2,300 ROLLS',
            packingListValue: '2,200 ROLLS',
            status: 'MISMATCH',
            severity: 'HIGH'
        });
        discrepancies.push({
            id: '4',
            field: 'Peso Neto (Kg)',
            blValue: '42,800',
            packingListValue: '28,025',
            status: 'MISMATCH',
            severity: 'HIGH'
        });
        errorCount = 4;
    } else {
        // Normal container - show some passed checks with minor issues
        discrepancies.push({
            id: '1',
            field: 'Consignatario',
            blValue: container.supplier,
            invoiceValue: container.supplier,
            status: 'MATCH',
            severity: 'LOW'
        });
        discrepancies.push({
            id: '2',
            field: 'Peso Bruto',
            blValue: container.weight || '24,500 Kg',
            packingListValue: container.weight || '24,500 Kg',
            status: 'MATCH',
            severity: 'LOW'
        });
        discrepancies.push({
            id: '3',
            field: 'Código HS',
            blValue: '5208.39.00',
            invoiceValue: '5208.39.00',
            status: 'MATCH',
            severity: 'LOW'
        });
        // Add one warning for realism
        discrepancies.push({
            id: '4',
            field: 'Fecha Factura',
            blValue: '15/01/2026',
            invoiceValue: '14/01/2026',
            status: 'MISMATCH',
            severity: 'LOW'
        });
        errorCount = 0;
    }

    const score = hasKnownErrors ? 35 : 95;
    const overallStatus = errorCount >= 2 ? 'REJECTED' : errorCount === 1 ? 'WARNING' : 'APPROVED';

    return {
        containerId: container.id,
        blNumber: container.containerNumber,
        overallStatus,
        score,
        scanDate: new Date().toISOString(),
        discrepancies
    };
};

export function ContainerCard({ container, onStatusChange }: Props) {
    const [showTracker, setShowTracker] = useState(false);
    const [showVerify, setShowVerify] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Get next status in the workflow
    const getNextStatus = (current: Container['status']): Container['status'] | null => {
        const flow: Container['status'][] = ['TRANSIT', 'PORT', 'CUSTOMS', 'WAREHOUSE'];
        const currentIndex = flow.indexOf(current);
        if (currentIndex < flow.length - 1) {
            return flow[currentIndex + 1];
        }
        return null; // Already at final status
    };

    // Get button label for next status
    const getNextStatusLabel = (current: Container['status']): string => {
        switch (current) {
            case 'TRANSIT': return '📍 Llegó a Puerto';
            case 'PORT': return '🛃 Pasar a Aduana';
            case 'CUSTOMS': return '✅ Liberar';
            default: return '';
        }
    };

    const getSencamerColor = (status: string) => {
        switch (status) {
            case 'VALID': return 'text-green-500';
            case 'WARNING': return 'text-yellow-500';
            case 'EXPIRED': return 'text-red-500';
            case 'PROCESSING': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    const getSencamerBadge = () => {
        if (container.sencamerStatus === 'EXPIRED') {
            return (
                <div className="mt-2 flex items-center justify-center border border-red-500/50 bg-red-500/10 rounded p-1 text-xs text-red-500 font-bold transform -rotate-2">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    SENCAMER EXPIRED
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <div className={twMerge(
                "bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700 mb-3 hover:border-slate-500 transition-colors cursor-pointer group relative overflow-hidden",
                container.sencamerStatus === 'EXPIRED' && "border-red-900/50"
            )}>
                {/* Status Dot & SLA Timer */}
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                    {/* SLA Timer */}
                    {container.slaDeadline && (
                        <div className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-bold shadow-sm flex items-center",
                            new Date(container.slaDeadline) < new Date() ? "bg-red-500 text-white animate-pulse" :
                                new Date(container.slaDeadline).getTime() - new Date().getTime() < 86400000 ? "bg-yellow-500 text-black" :
                                    "bg-slate-700 text-slate-300"
                        )}>
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(container.slaDeadline) < new Date() ? "VENCIDO" :
                                `${Math.ceil((new Date(container.slaDeadline).getTime() - new Date().getTime()) / (1000 * 3600))}h`}
                        </div>
                    )}
                    <div className={clsx("w-2 h-2 rounded-full", getSencamerColor(container.sencamerStatus), container.sencamerStatus === 'EXPIRED' && "animate-pulse")} />
                </div>

                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span className="font-mono text-slate-200 font-semibold text-sm">{container.containerNumber}</span>
                    {/* Assigned Analyst Avatar */}
                    {container.assignedTo && (
                        <div className="flex items-center bg-slate-700 rounded-full pr-2 pl-1 py-0.5 border border-slate-600">
                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-bold text-white mr-1.5 border border-white/20">
                                {container.assignedTo.name.charAt(0)}
                            </div>
                            <span className="text-[10px] font-medium text-slate-300">{container.assignedTo.name}</span>
                        </div>
                    )}
                </div>

                <h3 className="text-white font-medium text-sm truncate">{container.supplier}</h3>
                <p className="text-slate-500 text-xs mb-3">{container.textileType}</p>

                {/* Dynamic Info based on Status */}
                <div className="space-y-1">
                    {/* Vessel & Tracking - Always show if vessel is known or status is TRANSIT/PORT */}
                    {(container.status === 'TRANSIT' || container.status === 'PORT' || container.vessel) && (
                        <div className="flex justify-between items-center group/vessel">
                            <div className="flex items-center text-xs">
                                {container.status === 'TRANSIT' ? (
                                    <Ship className="w-3 h-3 mr-1 text-blue-400" />
                                ) : (
                                    <Anchor className="w-3 h-3 mr-1 text-yellow-500" />
                                )}
                                <span className={container.status === 'TRANSIT' ? "text-blue-400" : "text-yellow-500"}>
                                    {container.vessel || (container.status === 'TRANSIT' ? 'Vessel Assigned' : 'Vessel TBD')}
                                </span>
                                {container.eta && container.status === 'TRANSIT' && (
                                    <span className="ml-2 text-[10px] text-slate-500">ETA: {container.eta}</span>
                                )}
                            </div>

                            {/* Actions Group - Updated Visibility */}
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowChat(true); }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded shadow-lg shadow-emerald-900/50 transition-all hover:scale-105 flex items-center gap-1"
                                    title="Bitácora de Equipo"
                                >
                                    <MessageCircle className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">CHAT</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowVerify(true); }}
                                    className="bg-purple-600 hover:bg-purple-500 text-white p-1.5 rounded shadow-lg shadow-purple-900/50 transition-all hover:scale-105 flex items-center gap-1"
                                    title="Auditoría Antimultas"
                                >
                                    <AlertTriangle className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">AUDIT</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowTracker(true); }}
                                    className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded shadow-lg shadow-blue-900/50 transition-all hover:scale-105 flex items-center gap-1"
                                    title="Ver Informe Satelital"
                                >
                                    <Ship className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">INFO</span>
                                </button>
                                {/* Transport Assignment Button - Logic Check */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (container.sencamerStatus === 'VALID') alert("Abriendo Módulo de Asignación de Flota...");
                                    }}
                                    disabled={container.sencamerStatus !== 'VALID'}
                                    className={clsx(
                                        "p-1.5 rounded shadow-lg transition-all flex items-center gap-1",
                                        container.sencamerStatus === 'VALID'
                                            ? "bg-orange-600 hover:bg-orange-500 text-white hover:scale-105 shadow-orange-900/50 cursor-pointer"
                                            : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                                    )}
                                    title={container.sencamerStatus === 'VALID' ? "Asignar Transporte (Flota Propia)" : "BLOQUEADO: Requiere Permiso SENCAMER Vigente"}
                                >
                                    <Truck className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">TRUCK</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {container.status === 'CUSTOMS' && (
                        <div className="flex items-center text-xs text-slate-400">
                            <span className={clsx("flex items-center", getSencamerColor(container.sencamerStatus))}>
                                {container.sencamerStatus === 'VALID' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                {container.sencamerStatus === 'VALID' ? 'Permiso Vigente' : 'Trámite en Curso'}
                            </span>
                        </div>
                    )}
                </div>

                {getSencamerBadge()}

                {/* Progress Bar for Transit (Fake) */}
                {container.status === 'TRANSIT' && (
                    <div className="w-full bg-slate-700 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[75%]"></div>
                    </div>
                )}

                {/* Advance Button - Move to next status */}
                {onStatusChange && getNextStatus(container.status) && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const nextStatus = getNextStatus(container.status);
                            if (nextStatus && container.id) {
                                onStatusChange(container.id, nextStatus);
                            }
                        }}
                        className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-900/30"
                    >
                        <span>{getNextStatusLabel(container.status)}</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Activity Log Modal */}
            {showChat && (
                <ActivityLogModal
                    containerNumber={container.containerNumber}
                    onClose={() => setShowChat(false)}
                />
            )}

            {/* Verification Modal */}
            {showVerify && (
                <VerificationReportModal
                    report={generateVerificationReport(container)}
                    onClose={() => setShowVerify(false)}
                />
            )}

            {/* VesselTracker Modal */}
            {showTracker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
                            <div className="flex items-center space-x-2">
                                <Ship className="text-blue-500 w-5 h-5" />
                                <h3 className="text-white font-bold">Rastreo Satelital: {container.vessel || 'Buscando...'}</h3>
                            </div>
                            <button onClick={() => setShowTracker(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 bg-slate-950 relative flex flex-col md:flex-row">
                            {/* Data Panel */}
                            <div className="w-full md:w-1/3 border-r border-slate-800 p-6 space-y-6 overflow-y-auto">
                                <TrackerDataPanel vesselName={container.vessel || ''} />
                            </div>

                            {/* Map Panel */}
                            <div className="w-full md:w-2/3 relative bg-slate-800">
                                <MapLoader vesselName={container.vessel || ''} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Sub-components for cleaner code
import dynamic from 'next/dynamic';

const VesselMap = dynamic(() => import('./VesselMap'), { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-slate-500">Cargando Mapa...</div> });

function MapLoader({ vesselName }: { vesselName: string }) {
    const [coords, setCoords] = useState<{ lat: number, lon: number, destLat?: number, destLon?: number } | null>(null);

    React.useEffect(() => {
        // Fetch coordinates from our API
        fetch(`/api/marinetraffic?vessel=${encodeURIComponent(vesselName)}`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setCoords({
                        lat: data.data.lat,
                        lon: data.data.lon,
                        destLat: data.data.dest_lat,
                        destLon: data.data.dest_lon
                    });
                }
            });
    }, [vesselName]);

    if (!coords) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    return <VesselMap lat={coords.lat} lon={coords.lon} vesselName={vesselName} destLat={coords.destLat} destLon={coords.destLon} />;
}

function TrackerDataPanel({ vesselName }: { vesselName: string }) {
    const [data, setData] = useState<any>(null);

    React.useEffect(() => {
        fetch(`/api/marinetraffic?vessel=${encodeURIComponent(vesselName)}`)
            .then(res => res.json())
            .then(res => setData(res.data));
    }, [vesselName]);

    if (!data) return <div className="text-slate-500 text-sm">Cargando telemetría...</div>;

    return (
        <>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-slate-500 text-xs uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">Datos Técnicos del Buque</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                    <div>
                        <p className="text-slate-500">Bandera</p>
                        <p className="text-white font-medium">{data.flag || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Año Const.</p>
                        <p className="text-white font-medium">{data.year_built || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">IMO</p>
                        <p className="text-white font-mono">{data.imo || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Dimensiones</p>
                        <p className="text-white">{data.length}m x {data.width}m</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mt-4">
                <h4 className="text-slate-500 text-xs uppercase tracking-wider mb-2">Telemetría en Vivo</h4>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-white font-medium text-sm">{data.status}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-2 bg-slate-900 rounded">
                        <p className="text-slate-500 text-[10px]">VELOCIDAD</p>
                        <p className="text-blue-400 font-mono text-lg">{data.speed} <span className="text-xs">kn</span></p>
                    </div>
                    <div className="text-center p-2 bg-slate-900 rounded">
                        <p className="text-slate-500 text-[10px]">RUMBO</p>
                        <p className="text-blue-400 font-mono text-lg">{data.course}°</p>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <h4 className="text-slate-500 text-xs uppercase tracking-wider mb-2">Itinerario</h4>
                <div className="space-y-4 relative pl-4 border-l border-slate-700 ml-2">
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-900"></div>
                        <p className="text-slate-400 text-xs">Origen</p>
                        <p className="text-slate-300 text-sm">{data.last_port}</p>
                        <p className="text-slate-500 text-[10px]">{data.etd}</p>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900 animate-pulse"></div>
                        <p className="text-blue-400 text-xs">Destino</p>
                        <p className="text-white text-sm font-bold">{data.destination}</p>
                        <p className="text-blue-300/70 text-[10px]">ETA: {data.eta}</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-6">
                <p className="text-[10px] text-slate-600">Fuente: {data.source || 'Simulación MarineTraffic Enterprise'}</p>
            </div>
        </>
    );
}

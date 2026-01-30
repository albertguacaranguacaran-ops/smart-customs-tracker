'use client';

import React, { useState } from 'react';
import { VerificationReport } from '../types/verification';
import { AlertOctagon, CheckCircle2, XCircle, FileText, Globe, Download } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
    report: VerificationReport;
    onClose: () => void;
}

type Language = 'ES' | 'EN' | 'CN';

const DICTIONARY = {
    ES: {
        title: 'Informe de Auditoría Documental',
        subtitle: 'Detección de Riesgo Aduanero (IA)',
        score: 'Puntaje de Confianza',
        critical: 'DISCREPANCIAS CRÍTICAS',
        field: 'Campo Analizado',
        bl: 'Valor en B/L',
        doc: 'Valor en Factura/PL',
        result: 'Dictamen',
        approved: 'APROBADO PARA EMBARQUE',
        rejected: 'BLOQUEADO - RIESGO DE MULTA',
        download: 'Descargar PDF Oficial'
    },
    EN: {
        title: 'Document Audit Report',
        subtitle: 'Customs Risk Detection (AI)',
        score: 'Confidence Score',
        critical: 'CRITICAL DISCREPANCIES',
        field: 'Analyzed Field',
        bl: 'B/L Value',
        doc: 'Invoice/PL Value',
        result: 'Verdict',
        approved: 'APPROVED FOR SHIPMENT',
        rejected: 'BLOCKED - FINE RISK',
        download: 'Download Official PDF'
    },
    CN: {
        title: '文件审计报告',
        subtitle: '海关风险检测 (AI)',
        score: '置信度评分',
        critical: '关键差异',
        field: '分析字段',
        bl: '提单数值 (B/L)',
        doc: '发票/装箱单数值',
        result: '结论',
        approved: '批准装运',
        rejected: '已拦截 - 罚款风险',
        download: '下载官方 PDF'
    }
};

export function VerificationReportModal({ report, onClose }: Props) {
    const [lang, setLang] = useState<Language>('ES');

    // Mock PDF Generation Trigger
    const handleDownload = () => {
        alert(`Generando PDF Trilingüe para Contenedor ${report.blNumber}...\n(Simulación de Exportación)`);
    };

    const t = DICTIONARY[lang];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <AlertOctagon className={clsx("w-8 h-8", report.overallStatus === 'REJECTED' ? 'text-red-500' : 'text-green-500')} />
                            <h1 className="text-2xl font-bold">{t.title}</h1>
                        </div>
                        <p className="text-slate-400 text-sm ml-11">{t.subtitle} | Ref: {report.blNumber}</p>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
                        {(['ES', 'EN', 'CN'] as Language[]).map((l) => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                className={clsx(
                                    "px-3 py-1 rounded text-xs font-bold transition-colors",
                                    lang === l ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                                )}
                            >
                                {l === 'CN' ? '中文' : l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">

                    {/* Status Banner */}
                    <div className={clsx(
                        "rounded-lg p-6 mb-8 border-l-8 flex items-center justify-between shadow-sm",
                        report.overallStatus === 'REJECTED' ? "bg-red-50 border-red-500 text-red-900" : "bg-green-50 border-green-500 text-green-900"
                    )}>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">{report.overallStatus === 'REJECTED' ? t.rejected : t.approved}</h2>
                            <p className="opacity-75 mt-1">{report.discrepancies.length} issues detected across 3 documents</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold">{report.score}%</div>
                            <div className="text-xs uppercase font-bold opacity-60">{t.score}</div>
                        </div>
                    </div>

                    {/* Discrepancies Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center">
                            <AlertOctagon className="w-5 h-5 text-slate-500 mr-2" />
                            <h3 className="font-bold text-slate-700">{t.critical}</h3>
                        </div>

                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">{t.field}</th>
                                    <th className="px-6 py-4">{t.bl}</th>
                                    <th className="px-6 py-4">{t.doc}</th>
                                    <th className="px-6 py-4 text-center">{t.result}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {report.discrepancies.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">{item.field}</td>
                                        <td className="px-6 py-4 text-slate-600 font-mono bg-slate-50/50">{item.blValue}</td>
                                        <td className="px-6 py-4 text-slate-600 font-mono bg-blue-50/30">{item.invoiceValue || item.packingListValue}</td>
                                        <td className="px-6 py-4 text-center">
                                            {item.status === 'MISMATCH' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    MISMATCH
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    MATCH
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="bg-white p-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`⚠️ Alerta de Discrepancia Contenedor ${report.blNumber}\nVer reporte adjunto.`)}`, '_blank')}
                            className="px-4 py-2 rounded-lg bg-[#25D366] text-white font-bold hover:bg-[#128C7E] transition-colors flex items-center text-sm"
                        >
                            WhatsApp (Equipo)
                        </button>
                        <button
                            onClick={() => alert("Copiado al portapapeles para WeChat:\n\n请查收 HLBU... 的差异报告 (Please check discrepancy report)")}
                            className="px-4 py-2 rounded-lg bg-[#07C160] text-white font-bold hover:bg-[#06AD56] transition-colors flex items-center text-sm"
                        >
                            WeChat (Supplier)
                        </button>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg text-slate-500 font-medium hover:bg-slate-100 transition-colors"
                        >
                            Cerrar / Close
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-900/20"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            {t.download}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

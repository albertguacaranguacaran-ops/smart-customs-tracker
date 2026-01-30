import { NextRequest, NextResponse } from 'next/server';

const VESSELS_DB: Record<string, any> = {
    'MSC Zoe': {
        lat: 13.5,
        lon: -65.5,
        speed: 14.5,
        course: 270,
        status: 'Underway using Engine',
        etd: '2024-10-01 14:00 (Shanghai)',
        eta: '2024-10-25 08:00 (La Guaira)',
        destination: 'LA GUAIRA, VE',
        last_port: 'KINGSTON, JM',
        imo: '9703318',
        flag: 'Panama [PA]',
        year_built: 2015,
        length: 395,
        width: 59,
        dest_lat: 10.60,
        dest_lon: -66.95
    },
    'CMA CGM Marco Polo': {
        lat: 11.2,
        lon: -67.1,
        speed: 0.0,
        course: 120,
        status: 'Moored',
        etd: '2024-09-28 10:00 (Ningbo)',
        eta: '2024-10-20 16:00 (Puerto Cabello)',
        destination: 'PUERTO CABELLO, VE',
        last_port: 'CARTAGENA, CO',
        imo: '9454436',
        flag: 'Bahamas [BS]',
        year_built: 2012,
        length: 396,
        width: 53
    }
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const vesselName = searchParams.get('vessel');

    if (!vesselName) {
        return NextResponse.json({ error: 'Vessel name required' }, { status: 400 });
    }

    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple fuzzy match or default
    const foundVessel = Object.keys(VESSELS_DB).find(k => k.toLowerCase().includes(vesselName.toLowerCase()));

    if (foundVessel) {
        return NextResponse.json({
            status: 'success',
            source: 'MarineTraffic API (Mock)',
            data: VESSELS_DB[foundVessel]
        });
    }

    // Default Fallback for Demo
    return NextResponse.json({
        status: 'success',
        source: 'MarineTraffic API (Mock - Fallback)',
        data: {
            lat: 10.60,
            lon: -66.95,
            speed: 12.0,
            course: 180,
            status: 'Underway',
            etd: '2024-10-05 08:00 (Origin)',
            eta: '2024-10-30 12:00 (La Guaira)',
            destination: 'LA GUAIRA, VE',
            last_port: 'PANAMA CANAL',
            imo: '0000000'
        }
    });
}

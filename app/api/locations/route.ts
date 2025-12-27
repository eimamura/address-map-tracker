import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { normalizeAddress } from '@/lib/normalize';
import { geocodeAddress } from '@/lib/geocoding';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const locations = await prisma.location.findMany({
        where: { user_id: session.id },
        orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(locations);
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { raw_address } = body;

        if (!raw_address) {
            return NextResponse.json({ error: 'Missing address' }, { status: 400 });
        }

        const normalized = normalizeAddress(raw_address);
        if (!normalized) {
            return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
        }

        // Check DB cache
        const existing = await prisma.location.findUnique({
            where: {
                user_id_normalized_address: {
                    user_id: session.id,
                    normalized_address: normalized,
                },
            },
        });

        if (existing) {
            return NextResponse.json(existing);
        }

        // Top 3 Threat - Cost Abuse: Check if we want to rate limit here.
        // Minimally implemented by relying on unique constraint (one address per user).
        // If user spams unique addresses, it still costs.
        // MVP: No advanced rate limiting.

        // Geocode
        const point = await geocodeAddress(raw_address);
        if (!point) {
            return NextResponse.json({ error: 'Geocoding failed or address not found' }, { status: 404 });
        }

        // Insert
        try {
            const location = await prisma.location.create({
                data: {
                    user_id: session.id,
                    raw_address,
                    normalized_address: normalized,
                    display_name: point.label || raw_address,
                    latitude: point.latitude,
                    longitude: point.longitude,
                },
            });
            return NextResponse.json(location, { status: 201 });
        } catch (e: any) {
            if (e.code === 'P2002') {
                // Race condition hit (already exists), return existing
                const racedExisting = await prisma.location.findUnique({
                    where: {
                        user_id_normalized_address: {
                            user_id: session.id,
                            normalized_address: normalized,
                        },
                    },
                });
                return NextResponse.json(racedExisting);
            }
            throw e;
        }

    } catch (error) {
        console.error('Locations POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

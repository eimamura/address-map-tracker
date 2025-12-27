import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // BOLA protection: user_id must match
        const result = await prisma.location.deleteMany({
            where: {
                id: id,
                user_id: session.id,
            },
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'Not found or permission denied' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Delete location error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

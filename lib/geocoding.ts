import { LocationClient, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location";

const locationClient = new LocationClient({
    region: process.env.AWS_REGION || "us-east-1",
});

const INDEX_NAME = process.env.AMAZON_LOCATION_INDEX_NAME || "AddressMapTrackerIndex";

// Enable mock geocoding for local development without AWS credentials
const USE_MOCK_GEOCODING = process.env.USE_MOCK_GEOCODING === 'true';

export interface GeoPoint {
    latitude: number;
    longitude: number;
    label?: string;
}

// Simple mock geocoder for development - returns random coords in Japan
function mockGeocode(address: string): GeoPoint {
    // Generate deterministic but varied coordinates based on address hash
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        const char = address.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    // Tokyo area coordinates with some variation
    const baseLat = 35.6762;
    const baseLng = 139.6503;
    const latOffset = (Math.abs(hash) % 1000) / 10000;
    const lngOffset = (Math.abs(hash >> 10) % 1000) / 10000;

    return {
        latitude: baseLat + latOffset,
        longitude: baseLng + lngOffset,
        label: `[Mock] ${address}`,
    };
}

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
    if (!address) return null;

    // Use mock geocoding for development without AWS credentials
    if (USE_MOCK_GEOCODING) {
        console.log('[Geocoding] Using mock geocoder for:', address);
        return mockGeocode(address);
    }

    try {
        const command = new SearchPlaceIndexForTextCommand({
            IndexName: INDEX_NAME,
            Text: address,
            MaxResults: 1,
        });

        const response = await locationClient.send(command);

        if (response.Results && response.Results.length > 0) {
            const place = response.Results[0].Place;
            if (place && place.Geometry && place.Geometry.Point) {
                // Amazon Location (Results) returns [Lng, Lat]
                const [longitude, latitude] = place.Geometry.Point;
                return {
                    latitude,
                    longitude,
                    label: place.Label,
                };
            }
        }
        return null;
    } catch (error: any) {
        console.error("Geocoding error:", error);

        // Fallback to mock in development if AWS credentials fail
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[Geocoding] Falling back to mock geocoder due to AWS error');
            return mockGeocode(address);
        }

        return null;
    }
}

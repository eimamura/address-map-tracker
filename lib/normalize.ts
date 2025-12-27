export function normalizeAddress(rawAddress: string): string {
    if (!rawAddress) return ''
    return rawAddress.trim().toLowerCase()
}

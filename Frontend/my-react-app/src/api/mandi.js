import client from './client'

/**
 * Fetch mandi prices from the backend (cached daily from Data.gov.in)
 * @param {{ crop?: string, district?: string, state?: string }} filters
 */
export async function fetchMandiPrices({ crop, district, state } = {}) {
    const params = {}
    if (crop) params.crop = crop
    if (district) params.district = district
    if (state) params.state = state

    const res = await client.get('/mandi/', { params })
    return res.data // MandiPrice[]
}

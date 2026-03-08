import client from './client'

/** Fetch all active transport listings */
export async function fetchTransportListings() {
    const res = await client.get('/transport/')
    return res.data // TransportListingOut[]
}

/**
 * Create a new transport listing (farmer posting a job)
 * @param {{ crop_type: string, quantity_kg: number, pickup_location: string,
 *           destination: string, pickup_date: string, vehicle_type: string }} data
 */
export async function createTransportListing(data) {
    const res = await client.post('/transport/', data)
    return res.data
}

/**
 * Update a listing (e.g. driver accepts job by changing status)
 * @param {string} listingId
 * @param {object} updates
 */
export async function updateTransportListing(listingId, updates) {
    const res = await client.put(`/transport/${listingId}`, updates)
    return res.data
}

/** Delete a transport listing */
export async function deleteTransportListing(listingId) {
    await client.delete(`/transport/${listingId}`)
}

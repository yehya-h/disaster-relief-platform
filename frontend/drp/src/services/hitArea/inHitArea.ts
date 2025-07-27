import {getNearbyIncidents} from '../../api/incidentApi';

// this function checks if the given coordinates are within the hit area of any nearby incidents 
// returns true or false
export async function inHitArea(longitude: number, latitude: number): Promise<boolean> {
    try {
        const incidents = await getNearbyIncidents(longitude, latitude);
        return incidents.length > 0;
    } catch (error) {
        console.error('Error fetching nearby incidents:', error);
        return false; // In case of error, assume not in hit area
    }
}

export async function getIncident(longitude: number, latitude: number): Promise<any[] | null> {
    try {
        const incidents = await getNearbyIncidents(longitude, latitude);
        if (incidents.length > 0) {
            return incidents;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching incident:', error);
        return null;
    }
}

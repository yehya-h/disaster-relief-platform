export async function getCountryNameFromCoords(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'DisasterReliefPlatform/1.0 (hanan.kadi.2152003@gmail.com)', // Use your app name and a contact email
          'Accept-Language': 'en', // Optional: force English results
        },
      }
    );
    const data = await response.json();
    console.log('Nominatim API response:', data);

    if (data && data.address) {
      const country = data.address.country || '';
      // Try to get city, town, or village (Nominatim may use any of these)
      const city = data.address.city || data.address.town || data.address.village || '';
      if (city && country) return `${city}, ${country}`;
      if (country) return country;
      if (city) return city;
    }
    return 'Location not found';
  } catch (err) {
    console.log('Error fetching country:', err);
    return 'Failed to fetch location';
  }
} 
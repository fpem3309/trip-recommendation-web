const generateMapUrl = (places, recommendation) => {
  if (!places || places.length === 0) {
    return '';
  }
  if (places.length === 1) {
    return `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(places[0])}`;
  }

  const origin = encodeURIComponent(places[0]);
  const destination = encodeURIComponent(places[places.length - 1]);
  let waypoints = places.slice(1, -1).map(p => encodeURIComponent(p)).join('|');
  const allowedModes = ['walking', 'transit', 'bicycling', 'driving'];
  let modeParam = '';
  if(recommendation && recommendation.transportation) {
    modeParam = allowedModes.includes(recommendation.transportation) 
               ? `&mode=${recommendation.transportation}`
               : '&mode=driving'
  }
  if(waypoints.length > 0) {
    waypoints = `&waypoints=${waypoints}`;
  } else {
    waypoints = '';
  }
  return `https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&origin=${origin}&destination=${destination}${waypoints}${modeParam}`;
};

export const generateMapUrls = (googleMapPlaces, recommendation) => {
  if (googleMapPlaces) {
    return googleMapPlaces.map(dailyPlaces => generateMapUrl(dailyPlaces.places, recommendation));
  }
};
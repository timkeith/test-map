let map;
let bounds;

function initMap() {
  // temp center & zoom, set later by fitBounds
  map = new google.maps.Map(
    document.getElementById('map'),
    { center: { lat: 0, lng: 0 }, zoom: 2 });

  bounds = new google.maps.LatLngBounds();

  // Define your KML layers here
  const layerFiles = {
    //'Test': 'layers/test.kml',
    'Places': 'layers/places.kml',
  };

  for (const [name, url] of Object.entries(layerFiles)) {
    const layer = new google.maps.KmlLayer({
      url: `${window.location.origin}${window.location.pathname}${url}`,
      preserveViewport: true
    });

    // When the layer loads, expand the bounds
    google.maps.event.addListener(layer, 'defaultviewport_changed', () => {
      const layerBounds = layer.getDefaultViewport();
      bounds.union(layerBounds);
      map.fitBounds(bounds);
      console.log('bounds=', bounds);
    });

    layer.setMap(map);
  }
}

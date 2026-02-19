let map;
let bounds;

function initMap() {
  // temp center & zoom, set later by fitBounds
  map = new google.maps.Map(
    document.getElementById('map'),
    { center: { lat: 0, lng: 0 }, zoom: 2 });
  bounds = new google.maps.LatLngBounds();
  for (const [name, url] of Object.entries(layerFiles)) {
    const layer = new google.maps.KmlLayer({
      url:              `${window.location.origin}${window.location.pathname}${url}`,
      preserveViewport: true
    });
    google.maps.event.addListener(layer, 'defaultviewport_changed', () => {
      bounds.union(layer.getDefaultViewport());
      map.fitBounds(bounds);
    });
    layer.setMap(map);
  }
}

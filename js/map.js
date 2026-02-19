let map;
let bounds;

function initMap() {
  // temp center & zoom, set later by fitBounds
  map = new google.maps.Map(
    document.getElementById('map'),
    { center: { lat: 0, lng: 0 }, zoom: 2 });
  bounds = new google.maps.LatLngBounds();
  const container = document.getElementById('layers');
  for (const [name, url] of Object.entries(layerFiles)) {
    const layer = new google.maps.KmlLayer({
      url:              `${window.location.origin}${window.location.pathname}${url}`,
      preserveViewport: true
    });
    google.maps.event.addListener(layer, 'defaultviewport_changed', () => {
      bounds.union(layer.getDefaultViewport());
      map.fitBounds(bounds);
    });

    // Checkbox UI
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.onchange = () => {
      layer.setMap(checkbox.checked ? map : null);
    };

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + name));
    container.appendChild(label);
    container.appendChild(document.createElement('br'));
    layer.setMap(map);
  }
}

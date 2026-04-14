let map;
let allLayers = []; // for recenter: list of {layer: KmlLayer, checkbox: Element}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 2,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT // Moves buttons to avoid the legend
    }
  });
  const container = document.getElementById('layers');
  buildTree(layerData, container);
}

// Added forceSelect parameter (defaults to false)
function buildTree(data, parentElement, forceSelect = false) {
  const baseUrl = new URL('./', window.location.href).href;
  const ul = document.createElement('ul');

  data.forEach(item => {
    const li = document.createElement('li');
    const isFolder = !!item.children;

    // Logic: Selected if parent was selected OR if this item is explicitly selected
    const shouldBeChecked = forceSelect || !!item.selected;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = shouldBeChecked;

    const labelContainer = document.createElement('div');
    if (isFolder) labelContainer.className = 'folder-label';

    labelContainer.appendChild(checkbox);
    labelContainer.appendChild(document.createTextNode(' ' + item.name));
    li.appendChild(labelContainer);

    if (isFolder) {
      // Pass this item's selection status down to its children
      buildTree(item.children, li, shouldBeChecked);

      labelContainer.onclick = (e) => {
        if (e.target.type !== 'checkbox') {
          li.classList.toggle('folder-closed');
        }
      };

      checkbox.onchange = () => {
        const childBoxes = li.querySelectorAll('input[type="checkbox"]');
        childBoxes.forEach(cb => {
          if (cb.checked !== checkbox.checked) {
            cb.checked = checkbox.checked;
            cb.dispatchEvent(new Event('change'));
          }
        });
      };
    } else {
      const url = new URL('layers/' + item.url, baseUrl).href;
      
      // Initialize the layer visibility based on the checkbox state
      const layer = new google.maps.KmlLayer({ 
        url: url, 
        preserveViewport: true, 
        map: checkbox.checked ? map : null // Set map immediately based on selection
      });

      google.maps.event.addListenerOnce(layer, 'status_changed', () => {
        // Only trigger recenter if this specific layer was actually selected/loaded
        if (checkbox.checked && layer.getStatus() === google.maps.KmlLayerStatus.OK) {
          setTimeout(() => { recenterMap(); }, 200);
        }
      });

      allLayers.push({ layer: layer, checkbox: checkbox });
      checkbox.onchange = () => {
        layer.setMap(checkbox.checked ? map : null);
      };
    }
    ul.appendChild(li);
  });
  parentElement.appendChild(ul);
}
// Calculate the combined bounds of all checked KML layers and fit the map to them.
function recenterMap() {
  const newBounds = new google.maps.LatLngBounds();
  let hasActiveLayers = false;
  allLayers.forEach(item => {
    if (item.checkbox.checked) {
      const viewport = item.layer.getDefaultViewport();
      if (viewport) {  // if successfully loaded
        newBounds.union(viewport);
        hasActiveLayers = true;
      }
    }
  });
  if (hasActiveLayers) {
    map.fitBounds(newBounds);
  } else {
    // Default fall-back if nothing is selected
    map.setCenter({ lat: 0, lng: 0 });
    map.setZoom(2);
  }
}

// Global Select/Deselect All
function toggleAllLayers(shouldCheck) {
  const container = document.getElementById('layers');
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    if (checkbox.checked !== shouldCheck) {
      checkbox.checked = shouldCheck;
      checkbox.dispatchEvent(new Event('change'));
    }
  });
}

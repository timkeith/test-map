let map;
let bounds;

function initMap() {
  // Initialize Map
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 2
  });
  
  bounds = new google.maps.LatLngBounds();
  const container = document.getElementById('layers');

  // Start building the tree
  buildTree(layerData, container);
}

/**
 * Recursively builds the UI and initializes KML Layers
 */
function buildTree(data, parentElement) {
  const ul = document.createElement('ul');

  console.log('data:', data);
  data.forEach(item => {
    const li = document.createElement('li');
    const isFolder = !!item.children;

    // Checkbox element
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;

    // Row container (allows for clicking text to toggle folder)
    const labelContainer = document.createElement('div');
    if (isFolder) labelContainer.className = 'folder-label';

    labelContainer.appendChild(checkbox);
    labelContainer.appendChild(document.createTextNode(' ' + item.name));
    li.appendChild(labelContainer);

    if (isFolder) {
      // RECURSION: Build nested list
      buildTree(item.children, li);
      
      // Click logic to collapse/expand
      labelContainer.onclick = (e) => {
        if (e.target !== checkbox) {
          li.classList.toggle('folder-closed');
        }
      };

      // Folder checkbox logic: Toggle all children
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
      // LEAF NODE: Initialize Google Maps KML Layer
      const layer = new google.maps.KmlLayer({
        url: `${window.location.origin}${item.url}`,
        preserveViewport: true,
        map: map
      });

      // Auto-fit bounds when layers load
      google.maps.event.addListener(layer, 'defaultviewport_changed', () => {
        bounds.union(layer.getDefaultViewport());
        map.fitBounds(bounds);
      });

      // Layer toggle logic
      checkbox.onchange = (e) => {
        layer.setMap(checkbox.checked ? map : null);
        e.stopPropagation();
      };
    }

    ul.appendChild(li);
  });

  parentElement.appendChild(ul);
  return ul;
}

/**
 * Global Select/Deselect All
 */
function toggleAllLayers(shouldCheck) {
  const container = document.getElementById('layers');
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  
  checkboxes.forEach(cb => {
    if (cb.checked !== shouldCheck) {
      cb.checked = shouldCheck;
      cb.dispatchEvent(new Event('change'));
    }
  });
}

// Add the base map //
mapboxgl.accessToken =
  "pk.eyJ1IjoiemloZTk3IiwiYSI6ImNscmdmbHQ3aDBkeHkyam8ya2t2ZXd0M20ifQ.B_iS7dziGbvdQ8zPesJO-w";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/zihe97/clt1n2z6q00j901qz32uc93ld",
  center: [116.413384, 39.910925],
  zoom: 4
});

// Link to point data //
const data_url =
  "https://api.mapbox.com/datasets/v1/zihe97/clt1qi4fr5pyo1vl0mxfs8z52/features?access_token=pk.eyJ1IjoiemloZTk3IiwiYSI6ImNscmdmbHQ3aDBkeHkyam8ya2t2ZXd0M20ifQ.B_iS7dziGbvdQ8zPesJO-w";

// Add layers to the map //
map.on("load", () => {
  map.addLayer({
    id: "city",
    type: "circle",
    source: {
      type: "geojson",
      data: data_url
    },
    paint: {
      "circle-radius": 5,
      "circle-opacity": 1,
      "circle-color": [
        "match",
        ["get", "grade"],
        "Smallcities",
        "red",
        "Mediumcities",
        "blue",
        "Largecities",
        "yellow",
        "Supercities",
        "green",
        "black"
      ]
    }
  });
});

//Navigation Controller
map.addControl(new mapboxgl.NavigationControl());

//create label popup
var labelpopup = new mapboxgl.Popup({
  closeButton: false,
  className: "label-popup"
});

//on hover change cursor icon
map.on("mousemove", "city", function (e) {
  map.getCanvas().style.cursor = "pointer";
  //show name label
  var feature = e.features[0];
  labelpopup
    .setLngLat(feature.geometry.coordinates)
    .setText(feature.properties.city)
    .addTo(map);
});

//remove hover actions when mouse is moved away
map.on("mouseleave", "city", function () {
  map.getCanvas().style.cursor = "";
  labelpopup.remove();
});

//populate popup with point info
map.on("click", (event) => {
  const features = map.queryRenderedFeatures(event.point, {
    layers: ["city"]
  });
  if (!features.length) {
    return;
  }
  const feature = features[0];

  //Popup information
  const popup = new mapboxgl.Popup({ offset: [0, -15], className: "my-popup" })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(
      `<h3>${feature.properties.city}</h3><p>${feature.properties.country} <span style = "font: 400 11px 'Ubuntu Mono';"></p><p> ${feature.properties.GDP} hundred million RMB <span style = "font: 400 11px 'Ubuntu Mono';"><p><p>Part of the ${feature.properties.province} <span style = "font: 400 11px 'Ubuntu Mono';"></p><p>Part of the ${feature.properties.grade} <span style = "font: 400 11px 'Ubuntu Mono';"></p>`
    )
    .addTo(map);
  map.flyTo({
    center: feature.geometry.coordinates,
    zoom: 10
  });
});

// Add scale bar to the map //
const scale = new mapboxgl.ScaleControl({
  maxWidth: 100,
  unit: "metric"
});
map.addControl(scale, "bottom-right");

// Add Geocoder to the map //
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: {
    color: "red"
  },
  placeholder: "Search for places"
});
map.addControl(geocoder, "top-right");

// Add Geolocate Control to the map //
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  })
);

// Add Fullscreen Control to the map //
map.addControl(new mapboxgl.FullscreenControl());

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
  document.getElementById("map").style.width = "80%";
  document.getElementById("levels").style.marginLeft = "250px";
}
//dropdown filtering
function myFilterFunction(levelFilter, lvlname) {
  document.getElementById("lvlselected").innerHTML = lvlname;
  if (levelFilter == "any") {
    map.setFilter("city", null);
    const levelsfells = map.queryRenderedFeatures({
      Layers: "city"
    });
    newfelltable(levelsfells);
  } else {
    map.setFilter("city", ["==", "GDP", levelFilter]);
    const levelsfells = map.queryRenderedFeatures({
      Layers: "city",
      Filter: ["==", "GDP", levelFilter]
    });
    newfelltable(levelsfells);
  }
}

//build table -- NEEDS WORK - DOESNT FILTER AS INTENDED - have to double click??
function newfelltable(levelsfells) {
  var theTable = document.getElementById("fellsTableBody");
  theTable.innerHTML = "";
  for (let i = 0; i < levelsfells.length; i++) {
    if (levelsfells[i].properties.city == undefined) {
    } else {
      var newRow = theTable.insertRow(theTable.length);
      var fellcity = newRow.insertCell(0);
      var fellGDP = newRow.insertCell(1);
      fellcity.innerHTML = levelsfells[i].properties.city;
      fellGDP.innerHTML = parseInt(levelsfells[i].properties.GDP);
      const labelpopup = new mapboxgl.Popup({
        closeButton: false,
        className: "label-popup"
      });
      newRow.addEventListener("mouseover", () => {
        // Highlight corresponding feature on the map
        labelpopup
          .setLngLat(levelsfells[i].geometry.coordinates)
          .setText(levelsfells[i].properties.city)
          .addTo(map);
      });
      newRow.addEventListener("mouseleave", () => {
        // Highlight corresponding feature on the map
        labelpopup.remove();
      });
      newRow.addEventListener("click", () => {
        map.flyTo({
          center: [
            levelsfells[i].geometry.coordinates[0],
            levelsfells[i].geometry.coordinates[1]
          ],
          zoom: 11,
          essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
      });
    }
  }
  sortTable(theTable);
}

function sortTable(table) {
  var rows, switching, i, x, y, shouldSwitch;
  switching = true;
  /*loop to continue until no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows*/
    for (i = 0; i < rows.length - 1; i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[1];
      y = rows[i + 1].getElementsByTagName("TD")[1];
      //check if the two rows should switch place:
      if (Number(x.innerHTML) > Number(y.innerHTML)) {
        //if so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.getElementById("map").style.width = "100%";
  document.getElementById("levels").style.marginLeft = "0";
}
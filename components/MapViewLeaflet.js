import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// ============================================================
// PETA SUNGGUHAN (OpenStreetMap + Leaflet via WebView).
// Berlaku untuk Android, iOS, dan Web (iframe).
// Mode:
//  - "marker": tampilkan pin laporan; tap pin -> onMarkerPress(id).
//  - "picker": tap peta / geser pin memilih titik -> onPilih({lat,lng}).
// Komunikasi React <-> Leaflet lewat postMessage.
// ============================================================

// Center default: Kota Malang, Jawa Timur.
export const PUSAT_MALANG = { lat: -7.9666, lng: 112.6326 };

const buatHTML = (centerLat, centerLng, zoom, picker) => `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
  html,body{margin:0;padding:0;height:100%;background:#E5EAFF}
  #peta{height:100%;width:100%}
  .lp{display:flex;flex-direction:column;align-items:center;width:34px}
  .lp .b{width:34px;height:34px;border-radius:17px;border:2.5px solid #fff;
    display:flex;align-items:center;justify-content:center;font-size:15px;
    box-shadow:0 3px 8px rgba(40,40,90,.35)}
  .lp .t{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;
    border-top-width:9px;border-top-style:solid;margin-top:-1px}
  .leaflet-container{background:#E5EAFF;font-family:-apple-system,system-ui,sans-serif}
</style>
</head><body>
<div id="peta"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<script>
  var peta = L.map('peta', { zoomControl: true, attributionControl: true })
    .setView([${centerLat}, ${centerLng}], ${zoom});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(peta);

  var modePilih = ${picker ? 'true' : 'false'};
  var titikPilih = null;
  var markerDll = {};

  function kirim(payload) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
  }

  function pasangPin(lat, lng) {
    if (titikPilih) peta.removeLayer(titikPilih);
    titikPilih = L.marker([lat, lng], { draggable: true }).addTo(peta);
    titikPilih.on('dragend', function (ev) {
      var ll = ev.target.getLatLng();
      kirim({ type: 'map', lat: ll.lat, lng: ll.lng });
    });
    peta.panTo([lat, lng]);
  }

  peta.on('click', function (e) {
    if (!modePilih) return;
    pasangPin(e.latlng.lat, e.latlng.lng);
    kirim({ type: 'map', lat: e.latlng.lat, lng: e.latlng.lng });
  });

  function gambarMarker(data) {
    Object.keys(markerDll).forEach(function (id) { peta.removeLayer(markerDll[id]); });
    markerDll = {};
    (data.markers || []).forEach(function (it) {
      var ikon = L.divIcon({
        className: '',
        html: '<div class="lp' + (it.aktif ? ' aktif' : '') + '">' +
          '<div class="b" style="background:' + it.bg + ';color:' + it.fg + '">' + (it.emoji || '\\ud83d\\udccd') + '</div>' +
          '<div class="t" style="border-top-color:' + it.fg + '"></div></div>',
        iconSize: [34, 43], iconAnchor: [17, 43],
      });
      var m = L.marker([it.lat, it.lng], { icon: ikon, title: it.title || '' }).addTo(peta);
      m.bindTooltip(it.title || '', { direction: 'top', offset: [0, -44] });
      m.on('click', function () { kirim({ type: 'marker', id: it.id }); });
      markerDll[it.id] = m;
    });
    if (data.center) {
      peta.setView([data.center.lat, data.center.lng], data.zoom || peta.getZoom());
    }
    invalidate();
  }

  function invalidate() { setTimeout(function () { peta.invalidateSize(); }, 60); }

  window.addEventListener('message', function (ev) {
    try {
      var d = JSON.parse(ev.data);
      if (d.type === 'setMarkers') gambarMarker(d);
      if (d.type === 'pilih') pasangPin(d.lat, d.lng);
      if (d.type === 'fokus') { peta.setView([d.lat, d.lng], d.zoom || peta.getZoom()); invalidate(); }
    } catch (e) {}
  });

  kirim({ type: 'siap' });
  invalidate();
</script></body></html>`;

const MapViewLeaflet = forwardRef(function MapViewLeaflet(
  {
    center = PUSAT_MALANG,
    zoom = 13,
    markers = [],
    aktifId = null,
    picker = false,
    onMarkerPress = () => {},
    onPilih = () => {},
    style,
  },
  ref,
) {
  const webRef = useRef(null);
  const [siap, setSiap] = useState(false);

  // HTML dibuat sekali untuk kombinasi (center/zoom/picker) sama.
  const html = useMemo(
    () => buatHTML(center?.lat ?? PUSAT_MALANG.lat, center?.lng ?? PUSAT_MALANG.lng, zoom, picker),
    [center?.lat, center?.lng, zoom, picker],
  );

  const kirimData = useCallback((payload) => {
    try { webRef.current?.postMessage(JSON.stringify(payload)); } catch {}
  }, []);

  // Kirim ulang marker ke peta setiap data/keadaan aktif berubah.
  useEffect(() => {
    if (!siap) return;
    kirimData({
      type: 'setMarkers',
      markers: markers.map((m) => ({ ...m, aktif: String(m.id) === String(aktifId) })),
    });
  }, [siap, markers, aktifId, kirimData]);

  // Mode picker: pindahkan pin sesuai koordinat terpilih dari luar.
  useEffect(() => {
    if (!siap || !picker) return;
    if (center?.lat != null && center?.lng != null) {
      kirimData({ type: 'pilih', lat: center.lat, lng: center.lng });
    }
  }, [siap, picker, center?.lat, center?.lng, kirimData]);

  useImperativeHandle(ref, () => ({
    // Fokuskan peta ke satu titik.
    fokus: (lat, lng, zoomLevel) => {
      kirimData({ type: 'fokus', lat, lng, zoom: zoomLevel });
    },
  }), [kirimData]);

  const onMessage = (ev) => {
    try {
      const data = JSON.parse(ev.nativeEvent.data);
      if (data.type === 'siap') setSiap(true);
      else if (data.type === 'marker') onMarkerPress(data.id);
      else if (data.type === 'map') onPilih({ lat: data.lat, lng: data.lng });
    } catch {}
  };

  return (
    <WebView
      ref={webRef}
      source={{ html }}
      originWhitelist={['*']}
      onMessage={onMessage}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      style={style || styles.fill}
      containerStyle={styles.fill}
    />
  );
});

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

export default MapViewLeaflet;

let map;

document.addEventListener('DOMContentLoaded', async () => {
  map = L.map('map').setView([14.5, 76.5], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const [firsRes, hotspotsRes] = await Promise.all([
    fetch('/api/firs'),
    fetch('/api/hotspots')
  ]);

  const firs = await firsRes.json();
  const hotspots = await hotspotsRes.json();
  const hotspotFirIds = new Set(hotspots.flatMap(h => h.fir_ids));

  firs.forEach(fir => {
    const isHotspot = hotspotFirIds.has(fir.id);
    const color = isHotspot ? '#C8202F' : '#1A73E8';
    const marker = L.circleMarker([fir.lat, fir.lng], {
      radius: isHotspot ? 10 : 6,
      fillColor: color,
      color: '#fff',
      weight: 1,
      fillOpacity: 0.85
    }).addTo(map);

    marker.bindPopup(`
      <strong>${fir.fir_no}</strong><br>
      ${fir.crime_type}<br>
      ${fir.district}<br>
      <small>${fir.location_text}</small>
    `);
  });

  const listEl = document.getElementById('hotspot-list');
  if (hotspots.length === 0) {
    listEl.innerHTML = '<p class="muted">No hotspots detected.</p>';
    return;
  }

  hotspots.forEach(hs => {
    const item = document.createElement('div');
    item.className = 'hotspot-item';
    item.innerHTML = `
      <strong>${hs.district}</strong><br>
      ${hs.crime_type} · <span class="count">${hs.incident_count} incidents</span><br>
      <small class="muted">${hs.date_from} → ${hs.date_to}</small>
    `;
    item.addEventListener('click', () => {
      map.setView([hs.lat, hs.lng], 12);
    });
    listEl.appendChild(item);
  });
});

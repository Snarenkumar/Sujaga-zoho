document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fir-form');
  if (form) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const dtInput = form.querySelector('[name="date_time"]');
    if (dtInput && !dtInput.value) dtInput.value = now.toISOString().slice(0, 16);
  }
});

function fillDemoPreset(preset) {
  const randomNum = Math.floor(100 + Math.random() * 900);
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

  if (preset === 'chain') {
    document.getElementById('input_fir_no').value = `KA-BLR-2026-${randomNum}`;
    document.getElementById('input_date_time').value = now.toISOString().slice(0, 16);
    document.getElementById('input_district').value = 'Bengaluru Urban';
    document.getElementById('input_police_station').value = 'Koramangala PS';
    document.getElementById('input_ipc_sections').value = '379, 392';
    document.getElementById('input_crime_type').value = 'Chain Snatching';
    document.getElementById('input_location_text').value = '100 Feet Road, Indiranagar';
    document.getElementById('input_mo_description').value = 'Two accused on a black Pulsar 150 approached victim from behind on a two-wheeler, snatched gold chain and fled towards Hosur Road.';
    document.getElementById('input_accused_names').value = 'Ravi Pulsar';
    document.getElementById('input_victim_names').value = 'Sunita M';
  } else if (preset === 'burglary') {
    document.getElementById('input_fir_no').value = `KA-MNG-2026-${randomNum}`;
    document.getElementById('input_date_time').value = now.toISOString().slice(0, 16);
    document.getElementById('input_district').value = 'Mangaluru';
    document.getElementById('input_police_station').value = 'Kadri PS';
    document.getElementById('input_ipc_sections').value = '457, 380';
    document.getElementById('input_crime_type').value = 'Burglary';
    document.getElementById('input_location_text').value = 'Bejai Main Road, Mangaluru';
    document.getElementById('input_mo_description').value = 'Rear window forced open at night, jewellery and cash stolen. Entry via compound wall climb, exit through back lane.';
    document.getElementById('input_accused_names').value = 'Ganesh Murthy';
    document.getElementById('input_victim_names').value = 'K. Shetty';
  } else if (preset === 'theft') {
    document.getElementById('input_fir_no').value = `KA-MYS-2026-${randomNum}`;
    document.getElementById('input_date_time').value = now.toISOString().slice(0, 16);
    document.getElementById('input_district').value = 'Mysuru';
    document.getElementById('input_police_station').value = 'Nazarbad PS';
    document.getElementById('input_ipc_sections').value = '379';
    document.getElementById('input_crime_type').value = 'Two-Wheeler Theft';
    document.getElementById('input_location_text').value = 'Nazarbad Main Road, Mysuru';
    document.getElementById('input_mo_description').value = 'Unidentified person broke the ignition lock of a parked Honda Activa two-wheeler and fled within 2 minutes.';
    document.getElementById('input_accused_names').value = 'PK';
    document.getElementById('input_victim_names').value = 'Anil Kumar';
  }
}

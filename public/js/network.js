let network = null;
let accusedData = [];

document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch('/api/network');
  const data = await res.json();
  accusedData = data.nodes;

  const nodes = new vis.DataSet(data.nodes.map(n => ({
    id: n.id,
    label: n.label.split(' ')[0],
    title: `${n.label}\nRisk: ${n.risk_score}\nDistrict: ${n.district}`,
    color: {
      background: n.risk_score >= 80 ? '#F43F5E' : n.risk_score >= 60 ? '#FBBF24' : '#38BDF8',
      border: n.risk_score >= 80 ? 'rgba(244,63,94,0.3)' : n.risk_score >= 60 ? 'rgba(251,191,36,0.3)' : 'rgba(56,189,248,0.3)',
      highlight: { background: '#38BDF8', border: 'rgba(56,189,248,0.8)' }
    },
    font: { color: '#F8FAFC', size: 12, face: 'Plus Jakarta Sans' },
    borderWidth: 4
  })));

  const edges = new vis.DataSet(data.edges.map(e => {
    const days = e.last_seen_days_ago || 30;
    const opacity = Math.max(0.15, 1 - days / 120);
    const width = Math.max(1, 4 - days / 30);
    return {
      id: `${e.from}-${e.to}`,
      from: e.from,
      to: e.to,
      title: `FIR #${e.connected_via_fir}\nLast seen: ${e.last_seen_date}`,
      color: { color: `rgba(56, 189, 248, ${opacity})`, opacity, highlight: '#7dd3fc' },
      width,
      dashes: days > 60,
      _meta: e
    };
  }));

  const container = document.getElementById('network-graph');
  network = new vis.Network(container, { nodes, edges }, {
    physics: {
      stabilization: { iterations: 150 },
      barnesHut: { gravitationalConstant: -3000, springLength: 150 }
    },
    interaction: { hover: true, tooltipDelay: 100 },
    edges: { smooth: { type: 'continuous' } }
  });

  network.on('click', (params) => {
    const panel = document.getElementById('network-panel');
    const title = document.getElementById('panel-title');
    const content = document.getElementById('panel-content');

    if (params.nodes.length) {
      const nodeId = params.nodes[0];
      const accused = accusedData.find(a => a.id === nodeId);
      if (!accused) return;
      panel.classList.remove('hidden');
      title.textContent = accused.label;
      const level = accused.risk_score >= 80 ? 'high' : accused.risk_score >= 60 ? 'med' : 'low';
      content.innerHTML = `
        <dl class="panel-detail">
          <dt>District</dt><dd>${accused.district}</dd>
          <dt>Risk Score</dt><dd><span class="badge badge-${level}">${accused.risk_score}</span></dd>
          <dt>Linked FIRs</dt><dd>${accused.linked_firs.join(', ')}</dd>
        </dl>
        <div class="msg-actions" style="margin-top:1rem">
          <button onclick="openEvidenceModal('MO-001')">View evidence trail</button>
        </div>`;
    } else if (params.edges.length) {
      const edgeId = params.edges[0];
      const edge = edges.get(edgeId);
      if (!edge || !edge._meta) return;
      panel.classList.remove('hidden');
      title.textContent = 'Connection Details';
      content.innerHTML = `
        <dl class="panel-detail">
          <dt>Connected via</dt><dd>FIR ${edge._meta.connected_via_fir}</dd>
          <dt>Last seen together</dt><dd>${edge._meta.last_seen_date}</dd>
          <dt>Recency</dt><dd>${edge._meta.last_seen_days_ago} days ago</dd>
        </dl>`;
    }
  });

  const filter = new URLSearchParams(window.location.search).get('filter');
  if (filter === 'burglary') {
    title && (document.getElementById('panel-title').textContent = 'Burglary Cluster');
    document.getElementById('network-panel').classList.remove('hidden');
    document.getElementById('panel-content').innerHTML = `
      <p class="muted">Filtered view: Jayanagar/Yelahanka/Marathahalli burglary network.</p>
      <dl class="panel-detail">
        <dt>Suspects</dt><dd>Ganesh Murthy (ACC-005), Deepak Shetty (ACC-006)</dd>
        <dt>Linked FIRs</dt><dd>FIR-2025-007, FIR-2025-027, FIR-2025-033</dd>
      </dl>
      <button onclick="openEvidenceModal('MO-005')" class="btn-primary" style="margin-top:1rem">View evidence trail</button>`;
  }
});

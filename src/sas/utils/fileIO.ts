import { useModelStore } from '../stores/modelStore';
import { useResultStore } from '../stores/resultStore';

export function saveProject() {
  const snapshot = useModelStore.getState().getSnapshot();
  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'sas-project.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function loadProject() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      useModelStore.getState().loadModel(data);
      useResultStore.getState().clearResults();
    } catch (err) {
      console.error('Failed to load project:', err);
      alert('Failed to load project file. Please check the file format.');
    }
  };
  input.click();
}

export function exportResultsCSV() {
  const results = useResultStore.getState().results;
  if (!results) return;

  let csv = 'Type,ID,dx,dy,dz,rx,ry,rz\n';
  for (const nd of results.nodalDisplacements) {
    csv += `Displacement,${nd.nodeId},${nd.dx},${nd.dy},${nd.dz},${nd.rx},${nd.ry},${nd.rz}\n`;
  }

  csv += '\nType,ID,Fx,Fy,Fz,Mx,My,Mz\n';
  for (const r of results.reactions) {
    csv += `Reaction,${r.nodeId},${r.fx},${r.fy},${r.fz},${r.mx},${r.my},${r.mz}\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sas-results.csv';
  a.click();
  URL.revokeObjectURL(url);
}

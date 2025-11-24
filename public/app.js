const notarizeForm = document.getElementById('notarizeForm');
const fileInput = document.getElementById('fileInput');
const notarizeResult = document.getElementById('notarizeResult');

const verifyForm = document.getElementById('verifyForm');
const hashInput = document.getElementById('hashInput');
const verifyResult = document.getElementById('verifyResult');

notarizeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  notarizeResult.hidden = true;
  const file = fileInput.files[0];
  if (!file) return alert('Selecciona un archivo');

  const fd = new FormData();
  fd.append('file', file);

  notarizeResult.textContent = 'Subiendo y enviando transacción... espera';
  notarizeResult.hidden = false;

  const submitBtn = notarizeForm.querySelector('button');
  const origBtnHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.classList.add('btn-loading');
  submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Notarizando...';

  try {
    const res = await fetch('/notarize', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || JSON.stringify(json));

    notarizeResult.textContent = JSON.stringify(json, null, 2);
    notarizeResult.style.color = ''; 

    if (json?.fileHash) {
      try {
        hashInput.value = json.fileHash;
        hashInput.focus();
        hashInput.select();
        document.getElementById('verifyForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        console.warn('No se pudo copiar el fileHash al input de verificación', e);
      }
    }
  } catch (err) {
    if (err.message.includes('ya registrado')) {
      notarizeResult.textContent = 'Este archivo ya se encuentra registrado en la blockchain.';
      notarizeResult.style.color = '#e11d48'; 
    } else {
      notarizeResult.textContent = 'Error: ' + err.message;
      notarizeResult.style.color = '#e11d48'; 
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('btn-loading');
    submitBtn.innerHTML = origBtnHtml;
  }
});


function formatTimestamp(ts) {
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString();
}

verifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  verifyResult.hidden = true;
  const hash = hashInput.value.trim();
  if (!hash) return alert('Ingresa un hash');

  verifyResult.textContent = 'Consultando...';
  verifyResult.hidden = false;

  try {
    const res = await fetch('/verify?hash=' + encodeURIComponent(hash));
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || JSON.stringify(json));
    let fecha = "(No registrado)";
    if (json.timestamp && json.exists) {
      fecha = formatTimestamp(json.timestamp);
    }

    verifyResult.innerHTML = `
  <div class="field"><b>Estado:</b> ${json.exists ? '<span class="ok">Notarizado</span>' : '<span class="fail">No encontrado</span>'}</div>
  <div class="field"><b>Propietario:</b> ${json.owner}</div>
  <div class="field"><b>Fecha de registro:</b> ${fecha}</div>
  <div class="field"><b>Hash:</b> ${hash}</div>
  <div class="field"><b>URI:</b> ${json.uri || '(no hay dato)'}</div>
`;
  } catch (err) {
    verifyResult.textContent = 'Error: ' + err.message;
  }
});

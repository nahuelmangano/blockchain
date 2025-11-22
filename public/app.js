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

  try {
    const submitBtn = notarizeForm.querySelector('button');
    const origBtnHtml = submitBtn.innerHTML;
    // show spinner and disable button
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Notarizando...';

    const res = await fetch('/notarize', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || JSON.stringify(json));
    notarizeResult.textContent = JSON.stringify(json, null, 2);
    // Copiar automáticamente el fileHash al input de verificación y enfocarlo
    if (json?.fileHash) {
      try {
        hashInput.value = json.fileHash;
        // opcional: seleccionar el contenido y enfocar para que el usuario pueda verificar/pegar
        hashInput.focus();
        hashInput.select();
        // desplazar la vista hacia el formulario de verificación
        document.getElementById('verifyForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        // no bloquear la UI si algo falla aquí
        console.warn('No se pudo copiar el fileHash al input de verificación', e);
      }
    }
    // restore button state
    submitBtn.disabled = false;
    submitBtn.classList.remove('btn-loading');
    submitBtn.innerHTML = origBtnHtml;
  } catch (err) {
    notarizeResult.textContent = 'Error: ' + err.message;
  }
});

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
    verifyResult.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    verifyResult.textContent = 'Error: ' + err.message;
  }
});

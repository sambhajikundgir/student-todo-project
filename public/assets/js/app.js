// public/assets/js/app.js (REPLACE your old file with this)

/* ===== Helpers ===== */
function escapeHtml(str){
  return String(str||'').replace(/[&<>"']/g, function(m){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]);
  });
}

function showMsg(text, type='success'){
  const el = document.getElementById('msg');
  if(!el) return;
  el.style.display = 'block';
  el.className = 'alert ' + (type === 'success' ? 'success' : 'error');
  el.textContent = text;
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(()=>{ el.style.display = 'none'; }, 3000);
}

/* ===== Age & Validation ===== */
function computeAge(dobStr){
  if(!dobStr) return '';
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if(m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function validateForm(data){
  if(!data.name.trim()) return "Name is required.";
  if(!data.standard.trim()) return "Standard is required.";
  if(!data.dob) return "Date of birth is required.";
  if(!data.email.trim()) return "Email is required.";
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRe.test(data.email)) return "Invalid email.";
  const mob = data.father_mobile.trim();
  if(!/^\d{10}$/.test(mob)) return "Father mobile must be 10 digits numeric.";
  if(data.age === '' || isNaN(data.age)) return "Age calculation failed.";
  return "";
}

/* ===== DOM wiring & globals ===== */
const dobEl = document.getElementById('dob');
dobEl && dobEl.addEventListener('change', e=>{
  const age = computeAge(e.target.value);
  const ageEl = document.getElementById('age');
  if(ageEl) ageEl.value = age;
});

let isSubmitting = false;

/* ===== Form submit (Add Student) ===== */
const form = document.getElementById('studentForm');
if(form){
  // remove previous handler if any
  try{ form.removeEventListener('submit', form._submitHandler); } catch(e){}
  form._submitHandler = function(e){
    e.preventDefault();
    if(isSubmitting) return;
    isSubmitting = true;
    const submitBtn = document.querySelector('.btn.primary');
    if(submitBtn) submitBtn.disabled = true;

    const data = {
      name: document.getElementById('name').value || '',
      gender: document.getElementById('gender').value || '',
      standard: document.getElementById('standard').value || '',
      dob: document.getElementById('dob').value || '',
      age: document.getElementById('age').value || '',
      father_name: document.getElementById('father_name').value || '',
      father_mobile: document.getElementById('father_mobile').value || '',
      email: document.getElementById('email').value || ''
    };

    const err = validateForm(data);
    if(err){
      showMsg(err, 'error');
      isSubmitting = false;
      if(submitBtn) submitBtn.disabled = false;
      return;
    }

    fetch('/student-todo-project/api/add_student.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    })
    .then(r=>{
      if(!r.ok) throw new Error('Network response not OK');
      return r.json();
    })
    .then(res=>{
      if(res.success){
        showMsg('Student added.','success');
        form.reset();
        const ageEl = document.getElementById('age'); if(ageEl) ageEl.value = '';
        loadList();
      } else {
        showMsg(res.error || 'Server error','error');
      }
    })
    .catch(err=>{
      showMsg('Network error','error');
      console.error(err);
    })
    .finally(()=>{
      isSubmitting = false;
      if(submitBtn) submitBtn.disabled = false;
    });
  };

  form.addEventListener('submit', form._submitHandler);
}

/* ===== Clear button ===== */
const clearBtn = document.getElementById('clearBtn');
if(clearBtn){
  clearBtn.addEventListener('click', ()=>{
    form && form.reset();
    const ageEl = document.getElementById('age'); if(ageEl) ageEl.value = '';
    const msg = document.getElementById('msg'); if(msg) msg.style.display = 'none';
  });
}

/* ===== Load list + record count ===== */
function updateRecordCount(n){
  const cntEl = document.getElementById('recordCount');
  if(cntEl) cntEl.textContent = `Total records: ${n}`;
}

function loadList(){
  const listEl = document.getElementById('list');
  if(!listEl) return;
  fetch('/student-todo-project/api/list_students.php')
    .then(r=>{
      if(!r.ok) throw new Error('Network error');
      return r.json();
    })
    .then(data=>{
      if(!Array.isArray(data) || data.length === 0){
        listEl.innerHTML = '<div style="padding:12px;color:#64748b">No records found</div>';
        updateRecordCount(0);
        return;
      }

      let html = `<table><thead><tr>
        <th>ID</th><th>Name</th><th>Gender</th><th>Standard</th><th>DOB</th><th>Age</th><th>Father</th><th>Mob</th><th>Email</th><th>Actions</th>
      </tr></thead><tbody>`;

      data.forEach(s=>{
        html += `<tr>
          <td>${s.id}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.gender)}</td>
          <td>${escapeHtml(s.standard)}</td>
          <td>${escapeHtml(s.dob)}</td>
          <td>${escapeHtml(s.age)}</td>
          <td>${escapeHtml(s.father_name)}</td>
          <td>${escapeHtml(s.father_mobile)}</td>
          <td>${escapeHtml(s.email)}</td>
          <td>
            <button class="btn-sm view" data-id="${s.id}">View</button>
            <button class="btn-sm edit" data-id="${s.id}">Edit</button>
            <button class="btn-sm danger delete" data-id="${s.id}">Delete</button>
          </td>
        </tr>`;
      });

      html += '</tbody></table>';
      listEl.innerHTML = html;
      updateRecordCount(data.length);
      attachActionEvents();
    })
    .catch(err=>{
      console.error(err);
      listEl.innerHTML = '<div style="padding:12px;color:#ff4d4f">Could not load list</div>';
      updateRecordCount(0);
    });
}

/* ===== Attach actions (defensive) ===== */
function attachActionEvents(){
  // VIEW
  document.querySelectorAll(".view").forEach(btn=>{
    try{ btn.removeEventListener('click', btn._handler); } catch(e){}
    btn._handler = ()=> openViewModal(btn.dataset.id);
    btn.addEventListener('click', btn._handler);
  });

  // EDIT
  document.querySelectorAll(".edit").forEach(btn=>{
    try{ btn.removeEventListener('click', btn._handler); } catch(e){}
    btn._handler = ()=> openEditModal(btn.dataset.id);
    btn.addEventListener('click', btn._handler);
  });

  // DELETE
  document.querySelectorAll(".delete").forEach(btn=>{
    try{ btn.removeEventListener('click', btn._handler); } catch(e){}
    btn._handler = ()=>{
      const id = btn.dataset.id;
      if(!confirm("Are you sure to delete ID " + id + " ?")) return;
      fetch('/student-todo-project/api/delete_student.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ id })
      })
      .then(r=>r.json())
      .then(res=>{
        if(res.success){ showMsg('Deleted','success'); loadList(); }
        else showMsg(res.error || 'Delete failed','error');
      })
      .catch(()=> showMsg('Network error','error'));
    };
    btn.addEventListener('click', btn._handler);
  });
}

/* ===== Modal helpers ===== */
const modal = document.getElementById('studentModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalFoot = document.getElementById('modalFoot');
const modalClose = document.getElementById('modalClose');
const saveEditBtn = document.getElementById('saveEdit');
const cancelEditBtn = document.getElementById('cancelEdit');

function closeModal(){ if(!modal) return; modal.style.display = 'none'; modalBody.innerHTML = ''; modalFoot.style.display = 'none'; }
modalClose && modalClose.addEventListener('click', closeModal);
cancelEditBtn && cancelEditBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

/* ===== View logic ===== */
function openViewModal(id){
  if(!modal) return;
  modalTitle.textContent = 'View Student';
  modalFoot.style.display = 'none';
  fetch('/student-todo-project/api/view_student.php?id=' + encodeURIComponent(id))
    .then(r=>r.json())
    .then(res=>{
      if(!res.success){ showMsg(res.error || 'Not found','error'); return; }
      const d = res.data;
      modalBody.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><strong>Name</strong><div>${escapeHtml(d.name)}</div></div>
          <div><strong>Gender</strong><div>${escapeHtml(d.gender)}</div></div>
          <div><strong>Standard</strong><div>${escapeHtml(d.standard)}</div></div>
          <div><strong>DOB</strong><div>${escapeHtml(d.dob)}</div></div>
          <div><strong>Age</strong><div>${escapeHtml(d.age)}</div></div>
          <div><strong>Father Name</strong><div>${escapeHtml(d.father_name)}</div></div>
          <div><strong>Father Mobile</strong><div>${escapeHtml(d.father_mobile)}</div></div>
          <div><strong>Email</strong><div>${escapeHtml(d.email)}</div></div>
        </div>
      `;
      modal.style.display = 'flex';
    })
    .catch(()=> showMsg('Network error','error'));
}

/* ===== Edit logic ===== */
let currentEditId = null;
function openEditModal(id){
  if(!modal) return;
  modalTitle.textContent = 'Edit Student';
  modalFoot.style.display = 'flex';
  currentEditId = id;
  fetch('/student-todo-project/api/view_student.php?id=' + encodeURIComponent(id))
    .then(r=>r.json())
    .then(res=>{
      if(!res.success){ showMsg(res.error || 'Not found','error'); return; }
      const d = res.data;
      modalBody.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label>Name*<input type="text" id="m_name" value="${escapeHtml(d.name)}"></label>
          <label>Gender*<select id="m_gender"><option ${d.gender==='Male'?'selected':''}>Male</option><option ${d.gender==='Female'?'selected':''}>Female</option><option ${d.gender==='Other'?'selected':''}>Other</option></select></label>
          <label>Standard*<input type="text" id="m_standard" value="${escapeHtml(d.standard)}"></label>
          <label>DOB*<input type="date" id="m_dob" value="${escapeHtml(d.dob)}"></label>
          <label>Age*<input type="number" id="m_age" value="${escapeHtml(d.age)}"></label>
          <label>Father Name<input type="text" id="m_father_name" value="${escapeHtml(d.father_name)}"></label>
          <label>Father Mobile*<input type="text" id="m_father_mobile" value="${escapeHtml(d.father_mobile)}"></label>
          <label>Email*<input type="email" id="m_email" value="${escapeHtml(d.email)}"></label>
        </div>
      `;
      modal.style.display = 'flex';
    })
    .catch(()=> showMsg('Network error','error'));
}

saveEditBtn && saveEditBtn.addEventListener('click', ()=>{
  if(!currentEditId) return;
  const payload = {
    id: currentEditId,
    name: document.getElementById('m_name').value,
    gender: document.getElementById('m_gender').value,
    standard: document.getElementById('m_standard').value,
    dob: document.getElementById('m_dob').value,
    age: parseInt(document.getElementById('m_age').value) || 0,
    father_name: document.getElementById('m_father_name').value,
    father_mobile: document.getElementById('m_father_mobile').value,
    email: document.getElementById('m_email').value
  };

  if(!payload.name || !payload.standard || !payload.dob || !payload.email || !/^\d{10}$/.test(payload.father_mobile)){
    showMsg('Please fill required fields correctly','error'); return;
  }

  fetch('/student-todo-project/api/update_student.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  .then(r=>r.json())
  .then(res=>{
    if(res.success){
      showMsg('Updated','success');
      closeModal();
      loadList();
    } else showMsg(res.error || 'Update failed','error');
  })
  .catch(()=> showMsg('Network error','error'));
});

/* ===== initial load ===== */
loadList();

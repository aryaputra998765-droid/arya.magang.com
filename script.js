/* ════════════════════════════════════════════
   JURNAL PKL – MUHAMAD ARYA PUTRA PRATAMA
   script.js
════════════════════════════════════════════ */

const NAMA       = 'MUHAMAD ARYA PUTRA PRATAMA';
const KELAS      = 'XI TKJ 3';
const SEKOLAH    = 'SMK GEMA KARYA BAHANA';
const TEMPAT_PKL = 'PT. FORTUNET SOLUSI INDONESIA';
const NO_WA      = '6281234567890'; // ← ganti nomor WA pembimbing

const BATAS_JAM   = 8;
const BATAS_MENIT = 35;
const BATAS_TOTAL = BATAS_JAM * 60 + BATAS_MENIT;

let absensiDB  = JSON.parse(localStorage.getItem('pkl_absensi')  || '{}');
let kegiatanDB = JSON.parse(localStorage.getItem('pkl_kegiatan') || '[]');

function saveAbsensi()  { localStorage.setItem('pkl_absensi',  JSON.stringify(absensiDB));  }
function saveKegiatan() { localStorage.setItem('pkl_kegiatan', JSON.stringify(kegiatanDB)); }

const HARI  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function pad(n) { return String(n).padStart(2,'0'); }
function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getNowTime()  { const n=new Date(); return pad(n.getHours())+':'+pad(n.getMinutes())+':'+pad(n.getSeconds()); }
function getHari(d)    { return HARI[new Date(d+'T00:00:00').getDay()]; }
function formatTgl(d)  { const x=new Date(d+'T00:00:00'); return x.getDate()+' '+BULAN[x.getMonth()]+' '+x.getFullYear(); }
function formatTglFull(d) { return getHari(d)+', '+formatTgl(d); }
function hitungDurasi(masuk,pulang) {
  if(!masuk||!pulang) return '--';
  const [mH,mM,mS]=masuk.split(':').map(Number);
  const [pH,pM,pS]=pulang.split(':').map(Number);
  const det=(pH*3600+pM*60+pS)-(mH*3600+mM*60+mS);
  if(det<=0) return '--';
  return Math.floor(det/3600)+'j '+Math.floor((det%3600)/60)+'m';
}
function mntMasuk(masukStr) {
  if(!masukStr) return 9999;
  const [h,m]=masukStr.split(':').map(Number);
  return h*60+m;
}
function getKet(masukStr) {
  if(!masukStr) return '<span class="badge badge-alpha">Tidak Hadir</span>';
  return mntMasuk(masukStr)<=BATAS_TOTAL
    ? '<span class="badge badge-hadir">Tepat Waktu</span>'
    : `<span class="badge badge-alpha">Terlambat ${mntMasuk(masukStr)-BATAS_TOTAL} mnt</span>`;
}

/* ══ JAM ══ */
function updateClock() {
  const s = pad(new Date().getHours())+':'+pad(new Date().getMinutes())+':'+pad(new Date().getSeconds());
  ['clock-display','sidebar-clock-display','absen-live-clock'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=s;});
}
setInterval(updateClock,1000); updateClock();

/* ══ THEME ══ */
function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme')==='dark';
  document.documentElement.setAttribute('data-theme', dark?'light':'dark');
  document.getElementById('theme-btn').textContent = dark?'☀️ Light':'🌙 Dark';
  localStorage.setItem('pkl_theme', dark?'light':'dark');
}

/* ══ NAVIGASI ══ */
function showPage(id,el) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const t=document.getElementById('page-'+id); if(t) t.classList.add('active');
  if(el) el.classList.add('active');
  if(window.innerWidth<900) closeSidebar();
  if(id==='absensi')  initAbsensiPage();
  if(id==='kegiatan') initKegiatanPage();
}
function toggleSidebar(){ document.getElementById('sidebar').classList.toggle('open'); }
function closeSidebar()  { document.getElementById('sidebar').classList.remove('open'); }

/* ══ TAB MATERI ══ */
function setExpTab(name) {
  ['mikrotik','debian','cisco'].forEach(t=>{
    document.getElementById('exp-'+t).classList.toggle('active',t===name);
    document.getElementById('tab-'+t).classList.toggle('active',t===name);
  });
}
function setMikTab(n) {
  [1,2,3].forEach(i=>{
    document.getElementById('mik-content-'+i).style.display=i===n?'block':'none';
    const b=document.getElementById('mik-tab-'+i);
    if(b){b.className='btn '+(i===n?'btn-primary':'btn-ghost');b.style.fontSize='11px';}
  });
}
function setDebTab(n) {
  [1,2,3,4].forEach(i=>{
    document.getElementById('deb-content-'+i).style.display=i===n?'block':'none';
    const b=document.getElementById('deb-tab-'+i);
    if(b){b.className='btn '+(i===n?'btn-primary':'btn-ghost');b.style.fontSize='11px';}
  });
}

/* ════ ABSENSI ════ */
function initAbsensiPage() {
  const today=getTodayStr(); const now=new Date();
  const elF=document.getElementById('absen-date-full'); if(elF) elF.textContent=getHari(today).toUpperCase()+' // '+BULAN[now.getMonth()].toUpperCase()+' '+now.getFullYear();
  const elB=document.getElementById('absen-date-big');  if(elB) elB.textContent=now.getDate()+' '+BULAN[now.getMonth()]+' '+now.getFullYear();
  const data=absensiDB[today]||{};
  const bM=document.getElementById('btn-masuk'); const bP=document.getElementById('btn-pulang');
  if(data.masuk){ bM.disabled=true; bM.innerHTML='✅ Sudah Absen Masuk ('+data.masuk+')'; document.getElementById('display-masuk').textContent=data.masuk; }
  else { bM.disabled=false; bM.innerHTML='✅ Absen Masuk'; document.getElementById('display-masuk').textContent='Belum absen'; }
  if(data.masuk&&data.pulang){ bP.disabled=true; bP.innerHTML='🏠 Sudah Pulang ('+data.pulang+')'; document.getElementById('display-pulang').textContent=data.pulang; document.getElementById('display-durasi').textContent=hitungDurasi(data.masuk,data.pulang); }
  else if(data.masuk){ bP.disabled=false; bP.innerHTML='🏠 Absen Pulang'; document.getElementById('display-pulang').textContent='Belum pulang'; document.getElementById('display-durasi').textContent='--'; }
  else { bP.disabled=true; bP.innerHTML='🏠 Absen Pulang'; document.getElementById('display-pulang').textContent='Belum pulang'; document.getElementById('display-durasi').textContent='--'; }
  const ket=document.getElementById('display-ket-today'); if(ket) ket.innerHTML=getKet(data.masuk);
  const tot=Object.keys(absensiDB).filter(d=>absensiDB[d].masuk).length;
  const totEl=document.getElementById('display-total-hadir'); if(totEl) totEl.textContent=tot+' hari';
  const fb=document.getElementById('filter-bulan'); if(fb&&!fb.value) fb.value=today.slice(0,7);
  renderRiwayatAbsen();
}
function absenMasuk() {
  const today=getTodayStr();
  if(absensiDB[today]?.masuk){showToast('⚠️ Sudah absen masuk!');return;}
  if(!absensiDB[today]) absensiDB[today]={};
  absensiDB[today].masuk=getNowTime(); saveAbsensi();
  showToast('✅ Absen masuk: '+absensiDB[today].masuk); initAbsensiPage();
}
function absenPulang() {
  const today=getTodayStr();
  if(!absensiDB[today]?.masuk){showToast('⚠️ Absen masuk dulu!');return;}
  if(absensiDB[today]?.pulang){showToast('⚠️ Sudah absen pulang!');return;}
  absensiDB[today].pulang=getNowTime(); saveAbsensi();
  showToast('🏠 Absen pulang: '+absensiDB[today].pulang); initAbsensiPage();
}
function renderRiwayatAbsen() {
  const bulan=document.getElementById('filter-bulan')?.value||'';
  const tbody=document.getElementById('riwayat-tbody'); if(!tbody) return;
  const entries=Object.entries(absensiDB).filter(([d])=>!bulan||d.startsWith(bulan)).sort((a,b)=>b[0].localeCompare(a[0]));
  if(!entries.length){ tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:32px;font-size:12px;">Belum ada data absensi.</td></tr>'; return; }
  tbody.innerHTML=entries.map(([date,data],i)=>`
    <tr>
      <td style="font-size:11px;color:var(--muted)">${i+1}</td>
      <td><div style="font-weight:700;font-size:12px">${formatTgl(date)}</div><div style="font-size:10px;color:var(--muted)">${getHari(date)}</div></td>
      <td style="color:var(--green);font-weight:700">${data.masuk||'-'}</td>
      <td style="color:var(--accent2);font-weight:700">${data.pulang||'-'}</td>
      <td style="color:var(--accent)">${hitungDurasi(data.masuk,data.pulang)}</td>
      <td>${getKet(data.masuk)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="hapusAbsen('${date}')">🗑️</button></td>
    </tr>`).join('');
}
function hapusAbsen(date) {
  if(!confirm('Hapus absen '+formatTglFull(date)+'?')) return;
  delete absensiDB[date]; saveAbsensi(); initAbsensiPage(); showToast('🗑️ Dihapus.');
}
function exportAbsenCSV() {
  const bulan=document.getElementById('filter-bulan')?.value||'';
  const rows=Object.entries(absensiDB).filter(([d])=>!bulan||d.startsWith(bulan)).sort((a,b)=>a[0].localeCompare(b[0]));
  let csv='No,Tanggal,Hari,Jam Masuk,Jam Pulang,Durasi,Keterangan\n';
  rows.forEach(([date,data],i)=>{
    const ket=data.masuk?(mntMasuk(data.masuk)<=BATAS_TOTAL?'Tepat Waktu':'Terlambat'):'Tidak Hadir';
    csv+=`${i+1},"${formatTgl(date)}","${getHari(date)}","${data.masuk||'-'}","${data.pulang||'-'}","${hitungDurasi(data.masuk,data.pulang)}","${ket}"\n`;
  });
  unduhFile(csv,'rekap-absensi-arya.csv','text/csv');
  showToast('⬇️ CSV absensi diunduh!');
}

/* ════ LOG KEGIATAN + FOTO ════ */
function initKegiatanPage() {
  const tgl=document.getElementById('kg-tanggal'); if(tgl&&!tgl.value) tgl.value=getTodayStr();
  const fb=document.getElementById('filter-bulan-kg'); if(fb&&!fb.value) fb.value=getTodayStr().slice(0,7);
  renderHistoryKegiatan();
}

function previewFoto(input) {
  const box=document.getElementById('kg-foto-preview'); if(!box) return;
  box.innerHTML='';
  Array.from(input.files).forEach(file=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const wrap=document.createElement('div');
      wrap.style.cssText='position:relative;display:inline-block;margin:4px;';
      const img=document.createElement('img');
      img.src=e.target.result;
      img.style.cssText='width:80px;height:64px;object-fit:cover;border-radius:8px;border:1px solid var(--border);cursor:pointer;';
      img.onclick=()=>fotoFullscreen(e.target.result);
      const del=document.createElement('button');
      del.textContent='✕';
      del.style.cssText='position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:var(--accent2);border:none;color:#fff;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;';
      del.onclick=()=>wrap.remove();
      wrap.appendChild(img); wrap.appendChild(del); box.appendChild(wrap);
    };
    reader.readAsDataURL(file);
  });
}
function resetFotoPreview() { const b=document.getElementById('kg-foto-preview'); if(b) b.innerHTML=''; }

function simpanKegiatan() {
  const tgl   =document.getElementById('kg-tanggal').value;
  const judul =document.getElementById('kg-judul').value.trim();
  const lokasi=document.getElementById('kg-lokasi').value.trim();
  const desk  =document.getElementById('kg-deskripsi').value.trim();
  const kat   =document.getElementById('kg-kategori').value;
  if(!tgl||!judul){showToast('⚠️ Tanggal dan judul wajib diisi!');return;}
  const fotoInput=document.getElementById('kg-foto');
  const files=fotoInput?Array.from(fotoInput.files):[];
  function doSimpan(fotos) {
    kegiatanDB.unshift({id:Date.now(),tanggal:tgl,judul,lokasi:lokasi||'-',deskripsi:desk||'-',kategori:kat,waktu:getNowTime(),fotos});
    saveKegiatan();
    ['kg-judul','kg-lokasi','kg-deskripsi'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('kg-kategori').value='Networking';
    if(fotoInput) fotoInput.value='';
    resetFotoPreview();
    showToast('✅ Kegiatan tersimpan!');
    renderHistoryKegiatan();
  }
  if(!files.length){doSimpan([]);return;}
  const results=new Array(files.length); let done=0;
  files.forEach((file,idx)=>{
    const r=new FileReader();
    r.onload=e=>{results[idx]=e.target.result; if(++done===files.length) doSimpan(results);};
    r.readAsDataURL(file);
  });
}

function renderHistoryKegiatan() {
  const tbody=document.getElementById('kegiatan-tbody'); if(!tbody) return;
  const bulan=document.getElementById('filter-bulan-kg')?.value||'';
  const search=document.getElementById('search-kegiatan')?.value.toLowerCase()||'';
  const list=kegiatanDB
    .filter(k=>!bulan||k.tanggal.startsWith(bulan))
    .filter(k=>!search||k.judul.toLowerCase().includes(search)||k.deskripsi.toLowerCase().includes(search));
  const ctr=document.getElementById('kegiatan-count'); if(ctr) ctr.textContent=list.length;
  if(!list.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:32px;font-size:12px;">Belum ada kegiatan.</td></tr>';return;}
  tbody.innerHTML=list.map((k,i)=>{
    const thumb=k.fotos?.length
      ?`<div style="display:flex;align-items:center;gap:4px;"><img src="${k.fotos[0]}" style="width:44px;height:36px;object-fit:cover;border-radius:6px;border:1px solid var(--border);cursor:pointer;" onclick="lihatKegiatan(${k.id})"/>${k.fotos.length>1?`<span style="font-size:9px;color:var(--muted);">+${k.fotos.length-1}</span>`:''}</div>`
      :`<span style="color:var(--border);">—</span>`;
    return `<tr>
      <td style="font-size:11px;color:var(--muted)">${i+1}</td>
      <td><div style="font-weight:700;font-size:12px">${formatTgl(k.tanggal)}</div><div style="font-size:10px;color:var(--muted)">${getHari(k.tanggal)}</div></td>
      <td style="font-weight:600;color:var(--text)">${k.judul}</td>
      <td><span class="badge badge-kegiatan">${k.kategori}</span></td>
      <td>${thumb}</td>
      <td style="color:var(--muted);font-size:12px;max-width:150px">${k.deskripsi!=='-'?k.deskripsi.slice(0,50)+(k.deskripsi.length>50?'...':''):'-'}</td>
      <td style="font-size:11px;color:var(--muted)">${k.lokasi}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm" onclick="lihatKegiatan(${k.id})" title="Lihat">👁️</button>
        <button class="btn btn-primary btn-sm" onclick="kirimLaporan(${k.id})" title="Kirim Laporan">📤</button>
        <button class="btn btn-danger btn-sm" onclick="hapusKegiatan(${k.id})" title="Hapus">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function lihatKegiatan(id) {
  const k=kegiatanDB.find(x=>x.id===id); if(!k) return;
  document.getElementById('modal-kg-title').textContent   =k.judul;
  document.getElementById('modal-kg-tanggal').textContent =formatTglFull(k.tanggal);
  document.getElementById('modal-kg-waktu').textContent   ='🕐 Dicatat: '+k.waktu;
  document.getElementById('modal-kg-kat').innerHTML       ='<span class="badge badge-kegiatan">'+k.kategori+'</span>';
  document.getElementById('modal-kg-lokasi').textContent  =k.lokasi;
  document.getElementById('modal-kg-desk').textContent    =k.deskripsi;
  const fotoBox=document.getElementById('modal-kg-fotos');
  if(fotoBox) {
    if(k.fotos?.length) {
      fotoBox.style.display='block';
      fotoBox.innerHTML=`<div style="font-size:10px;color:var(--muted);margin-bottom:10px;letter-spacing:1px;">📸 FOTO (${k.fotos.length})</div><div class="foto-grid">${k.fotos.map((f,i)=>`<div class="foto-thumb-wrap" onclick="fotoFullscreen('${f}')"><img src="${f}" class="foto-thumb"/><div class="foto-thumb-overlay">🔍</div></div>`).join('')}</div>`;
    } else { fotoBox.style.display='none'; }
  }
  document.getElementById('modal-kg-kirim-btn').onclick=()=>{closeModal('modal-kegiatan');kirimLaporan(id);};
  openModal('modal-kegiatan');
}

function fotoFullscreen(src) {
  const ov=document.createElement('div'); ov.className='foto-fullscreen-overlay'; ov.onclick=()=>document.body.removeChild(ov);
  const img=document.createElement('img'); img.src=src; img.className='foto-fullscreen-img'; img.onclick=e=>e.stopPropagation();
  const btn=document.createElement('button'); btn.className='foto-fullscreen-close'; btn.textContent='✕'; btn.onclick=()=>document.body.removeChild(ov);
  ov.appendChild(img); ov.appendChild(btn); document.body.appendChild(ov);
}

function hapusKegiatan(id) {
  if(!confirm('Hapus kegiatan ini?')) return;
  kegiatanDB=kegiatanDB.filter(k=>k.id!==id); saveKegiatan(); renderHistoryKegiatan(); showToast('🗑️ Dihapus.');
}

/* ════ KIRIM LAPORAN ════ */
function kirimLaporan(id) {
  const k=kegiatanDB.find(x=>x.id===id); if(!k) return;
  document.getElementById('kirim-judul').textContent  =k.judul;
  document.getElementById('kirim-tanggal').textContent=formatTglFull(k.tanggal);
  document.getElementById('kirim-kat').innerHTML      ='<span class="badge badge-kegiatan">'+k.kategori+'</span>';
  document.getElementById('kirim-lokasi').textContent =k.lokasi;
  document.getElementById('kirim-desk').textContent   =k.deskripsi;
  const fotoBox=document.getElementById('kirim-fotos');
  if(fotoBox) fotoBox.innerHTML=k.fotos?.length?k.fotos.map((f,i)=>`<img src="${f}" style="width:64px;height:52px;object-fit:cover;border-radius:6px;border:1px solid var(--border);cursor:pointer;" onclick="fotoFullscreen('${f}')" title="Foto ${i+1}"/>`).join(''):'<span style="font-size:11px;color:var(--muted);">Tidak ada foto</span>';
  document.getElementById('btn-kirim-wa').onclick      =()=>kirimWA(k);
  document.getElementById('btn-kirim-download').onclick=()=>downloadLaporan(k);
  document.getElementById('btn-kirim-print').onclick   =()=>{downloadLaporan(k);showToast('💡 Buka file HTML yang diunduh → Ctrl+P untuk print/PDF!');};
  openModal('modal-kirim');
}

function kirimWA(k) {
  const absen=absensiDB[k.tanggal]||{};
  const jam=absen.masuk?`${absen.masuk||'-'} s/d ${absen.pulang||'belum pulang'}`:'Tidak ada data';
  const ket=absen.masuk?(mntMasuk(absen.masuk)<=BATAS_TOTAL?'✅ Tepat Waktu':'⚠️ Terlambat '+( mntMasuk(absen.masuk)-BATAS_TOTAL)+' mnt'):'-';
  const pesan=`*📋 LAPORAN KEGIATAN PKL*
━━━━━━━━━━━━━━━━━━━━
*Nama*    : ${NAMA}
*Kelas*   : ${KELAS}
*Sekolah* : ${SEKOLAH}
*Tempat*  : ${TEMPAT_PKL}
━━━━━━━━━━━━━━━━━━━━
📅 *Tanggal*  : ${formatTglFull(k.tanggal)}
📌 *Kegiatan* : ${k.judul}
🏷️ *Kategori* : ${k.kategori}
📍 *Lokasi*   : ${k.lokasi}
⏰ *Absensi*  : ${jam}
✔️ *Status*   : ${ket}
━━━━━━━━━━━━━━━━━━━━
📝 *Deskripsi*:
${k.deskripsi}
━━━━━━━━━━━━━━━━━━━━
${k.fotos?.length?`📸 Terlampir ${k.fotos.length} foto kegiatan`:''}
_Dikirim dari Jurnal PKL – ${NAMA}_`;
  window.open('https://wa.me/'+NO_WA+'?text='+encodeURIComponent(pesan),'_blank');
  showToast('📱 Membuka WhatsApp...');
}

function downloadLaporan(k) {
  const absen=absensiDB[k.tanggal]||{};
  const durasi=hitungDurasi(absen.masuk,absen.pulang);
  const ket=absen.masuk?(mntMasuk(absen.masuk)<=BATAS_TOTAL?'Tepat Waktu':'Terlambat '+( mntMasuk(absen.masuk)-BATAS_TOTAL)+' mnt'):'Tidak Hadir';
  const fotoHTML=k.fotos?.length
    ?k.fotos.map((f,i)=>`<div style="display:inline-block;margin:6px;text-align:center;"><img src="${f}" style="width:180px;height:140px;object-fit:cover;border-radius:8px;border:2px solid #ddd;"/><div style="font-size:11px;color:#888;margin-top:4px;">Foto ${i+1}</div></div>`).join('')
    :'<p style="color:#999;font-style:italic;">Tidak ada foto terlampir.</p>';
  const html=`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/><title>Laporan PKL</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#333;}
.header{text-align:center;border-bottom:3px solid #0099cc;padding-bottom:20px;margin-bottom:28px;}
.header h1{color:#0099cc;font-size:22px;margin:0 0 8px;}
.header p{color:#666;font-size:13px;margin:3px 0;}
.section{margin-bottom:22px;}
.section h3{font-size:13px;color:#0099cc;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:12px;}
.row{display:flex;gap:10px;margin-bottom:8px;}
.lbl{font-weight:bold;min-width:130px;font-size:13px;color:#555;}
.val{font-size:13px;}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;background:#e0f7ff;color:#0099cc;border:1px solid #0099cc;}
.ket-ok{color:#059669;font-weight:bold;} .ket-late{color:#e05a22;font-weight:bold;}
.desk{background:#f8f9fc;border-left:3px solid #0099cc;padding:14px;border-radius:4px;font-size:14px;line-height:1.7;white-space:pre-wrap;}
.footer{text-align:center;margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#aaa;}
@media print{body{margin:10px;}}</style></head><body>
<div class="header"><h1>📋 LAPORAN KEGIATAN PKL</h1><p><strong>${NAMA}</strong> &nbsp;|&nbsp; ${KELAS} &nbsp;|&nbsp; ${SEKOLAH}</p><p>${TEMPAT_PKL}</p></div>
<div class="section"><h3>Informasi Kegiatan</h3>
<div class="row"><span class="lbl">Tanggal</span><span class="val">${formatTglFull(k.tanggal)}</span></div>
<div class="row"><span class="lbl">Judul</span><span class="val"><strong>${k.judul}</strong></span></div>
<div class="row"><span class="lbl">Kategori</span><span class="val"><span class="badge">${k.kategori}</span></span></div>
<div class="row"><span class="lbl">Lokasi</span><span class="val">${k.lokasi}</span></div></div>
<div class="section"><h3>Data Absensi</h3>
<div class="row"><span class="lbl">Jam Masuk</span><span class="val ket-ok">${absen.masuk||'-'}</span></div>
<div class="row"><span class="lbl">Jam Pulang</span><span class="val ket-late">${absen.pulang||'-'}</span></div>
<div class="row"><span class="lbl">Durasi</span><span class="val">${durasi}</span></div>
<div class="row"><span class="lbl">Keterangan</span><span class="val ${ket.includes('Terlambat')?'ket-late':'ket-ok'}">${ket}</span></div></div>
<div class="section"><h3>Deskripsi</h3><div class="desk">${k.deskripsi}</div></div>
<div class="section"><h3>Foto Kegiatan (${k.fotos?.length||0})</h3>${fotoHTML}</div>
<div class="footer">Laporan dibuat: ${new Date().toLocaleString('id-ID')} | Jurnal PKL – ${NAMA}</div>
</body></html>`;
  unduhFile(html,`laporan-${k.tanggal}-${k.judul.slice(0,15).replace(/\s+/g,'-').toLowerCase()}.html`,'text/html');
  showToast('⬇️ Laporan diunduh!');
}

/* ════ UTILS ════ */
function unduhFile(isi,nama,tipe) {
  const blob=new Blob([isi],{type:tipe+';charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=nama; a.click();
  URL.revokeObjectURL(url);
}
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click',e=>{if(e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');});
function showToast(msg,dur=2800) {
  const t=document.getElementById('toast-msg'); if(!t) return;
  t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),dur);
}

/* ════ INIT ════ */
window.addEventListener('load',()=>{
  const theme=localStorage.getItem('pkl_theme')||'dark';
  document.documentElement.setAttribute('data-theme',theme);
  const btn=document.getElementById('theme-btn'); if(btn) btn.textContent=theme==='dark'?'🌙 Dark':'☀️ Light';
  const today=getTodayStr();
  const fb=document.getElementById('filter-bulan'); if(fb) fb.value=today.slice(0,7);
  const fbk=document.getElementById('filter-bulan-kg'); if(fbk) fbk.value=today.slice(0,7);
  const kgT=document.getElementById('kg-tanggal'); if(kgT) kgT.value=today;
  initAbsensiPage();
  document.getElementById('main').addEventListener('click',()=>{if(window.innerWidth<900) closeSidebar();});
});

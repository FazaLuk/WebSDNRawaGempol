// =======================
// TAMPILKAN DATA
// =======================
function handleTampilkanKehadiran() {
  let kelas = document.getElementById("kelasKehadiran").value;
  let tanggal = document.getElementById("tanggalKehadiran").value;

  if (!kelas || !tanggal) {
    alert("Pilih kelas dan tanggal dulu!");
    return;
  }

  state.currentKelas = kelas;
  state.currentTanggal = tanggal;

  // 🔥 SET DEFAULT HADIR
  let siswaList = state.dataSiswa.filter((s) => s.kelas === kelas);

  siswaList.forEach((s) => {
    let sudahAda = state.dataKehadiran.find(
      (k) => k.nisn === s.nisn && k.tanggal === tanggal,
    );

    if (!sudahAda) {
      state.dataKehadiran.push({
        nisn: s.nisn,
        tanggal: tanggal,
        status: "Hadir",
      });
    }
  });

  renderKehadiran();

  let card = document.getElementById("cardKehadiran");
  if (card) card.style.display = "flex";

  renderStatKehadiranPage();
}

// =======================
// RENDER TABLE
// =======================
function renderKehadiran() {
  let table = document.getElementById("tableKehadiran");
  if (!table) return;

  let siswa = state.dataSiswa.filter((s) => s.kelas === state.currentKelas);

  let html = "";

  siswa.forEach((s) => {
    let data = state.dataKehadiran.find(
      (k) => k.nisn === s.nisn && k.tanggal === state.currentTanggal,
    );

    let status = data?.status || "Hadir";

    let classStatus =
      status === "Hadir"
        ? "status-hadir"
        : status === "Izin"
          ? "status-izin"
          : status === "Sakit"
            ? "status-sakit"
            : "status-alpha";

    html += `
<tr>
<td>${s.nama}</td>
<td>
<select 
  class="status-select ${classStatus}" 
  onchange="updateKehadiran('${s.nisn}', this.value); updateWarna(this)">
  
  <option ${status === "Hadir" ? "selected" : ""}>Hadir</option>
  <option ${status === "Izin" ? "selected" : ""}>Izin</option>
  <option ${status === "Sakit" ? "selected" : ""}>Sakit</option>
  <option ${status === "Alpha" ? "selected" : ""}>Alpha</option>

</select>
</td>
</tr>
`;
  });

  table.innerHTML = html;
}

function updateWarna(select) {
  select.classList.remove(
    "status-hadir",
    "status-izin",
    "status-sakit",
    "status-alpha",
  );

  if (select.value === "Hadir") select.classList.add("status-hadir");
  else if (select.value === "Izin") select.classList.add("status-izin");
  else if (select.value === "Sakit") select.classList.add("status-sakit");
  else select.classList.add("status-alpha");
}

window.updateWarna = updateWarna;

// =======================
// UPDATE DATA (ANTI DUPLIKAT 🔥)
// =======================
function updateKehadiran(nisn, status) {
  let index = state.dataKehadiran.findIndex(
    (k) => k.nisn === nisn && k.tanggal === state.currentTanggal,
  );

  if (index !== -1) {
    state.dataKehadiran[index].status = status;
  } else {
    state.dataKehadiran.push({
      nisn,
      status,
      tanggal: state.currentTanggal,
    });
  }
}

// =======================
// SIMPAN
// =======================
function handleSimpanKehadiran() {
  localStorage.setItem("dataKehadiran", JSON.stringify(state.dataKehadiran));

  renderStatKehadiranPage();

  alert("Semua data kehadiran tersimpan!");
}

// =======================
// LOAD
// =======================
function loadKehadiran() {
  let data = localStorage.getItem("dataKehadiran");
  if (data) {
    state.dataKehadiran = JSON.parse(data);
  }
}

// =======================
// STATISTIK
// =======================
function renderStatKehadiranPage() {
  let hadir = 0,
    izin = 0,
    sakit = 0,
    alpha = 0;

  let data = state.dataKehadiran.filter((k) => {
    let siswa = state.dataSiswa.find((s) => s.nisn === k.nisn);
    return (
      k.tanggal === state.currentTanggal &&
      siswa &&
      siswa.kelas === state.currentKelas
    );
  });

  data.forEach((k) => {
    if (k.status === "Hadir") hadir++;
    else if (k.status === "Izin") izin++;
    else if (k.status === "Sakit") sakit++;
    else alpha++;
  });

  document.getElementById("jmlHadir").innerText = hadir;
  document.getElementById("jmlIzin").innerText = izin;
  document.getElementById("jmlSakit").innerText = sakit;
  document.getElementById("jmlAlpha").innerText = alpha;
}

function exportKehadiranExcel() {
  let kelas = state.currentKelas;
  let tanggal = state.currentTanggal;

  if (!kelas || !tanggal) {
    alert("Pilih kelas dan tanggal dulu!");
    return;
  }

  // 🔥 ambil data sesuai filter
  let data = state.dataKehadiran.filter((k) => {
    let siswa = state.dataSiswa.find((s) => s.nisn === k.nisn);
    return siswa && siswa.kelas === kelas && k.tanggal === tanggal;
  });

  if (data.length === 0) {
    alert("Belum ada data kehadiran!");
    return;
  }

  // 🔥 format data
  let exportData = data.map((k, index) => {
    let siswa = state.dataSiswa.find((s) => s.nisn === k.nisn);

    return {
      No: index + 1,
      Nama: siswa?.nama || "-",
      Kelas: siswa?.kelas || "-",
      Tanggal: formatTanggalIndonesia(k.tanggal),
      Status: k.status,
    };
  });

  // 🔥 buat worksheet
  let worksheet = XLSX.utils.json_to_sheet(exportData, {
    header: ["No", "Nama", "Kelas", "Tanggal", "Status"],
  });

  // 🔥 buat workbook
  let workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Kehadiran");

  // 🔥 download
  XLSX.writeFile(workbook, `Kehadiran_${kelas}_${tanggal}.xlsx`);
}
function formatTanggalIndonesia(tanggal) {
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  let t = new Date(tanggal);
  return `${t.getDate()} ${bulan[t.getMonth()]} ${t.getFullYear()}`;
}

window.exportKehadiranExcel = exportKehadiranExcel;
// =======================
// EXPORT GLOBAL
// =======================
window.handleTampilkanKehadiran = handleTampilkanKehadiran;
window.updateKehadiran = updateKehadiran;
window.handleSimpanKehadiran = handleSimpanKehadiran;
window.renderKehadiran = renderKehadiran;
window.loadKehadiran = loadKehadiran;

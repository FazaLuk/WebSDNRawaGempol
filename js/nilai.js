// =======================
// RENDER NILAI
// =======================
function renderNilai() {
  let kelas = document.getElementById("filterKelasNilai").value;
  let mapel = document.getElementById("filterMapelNilai").value;

  let siswaList = state.dataSiswa.filter((s) => s.kelas === kelas);

  let html = `
    <table class="table table-bordered">
      <tr>
        <th>Nama</th>
        <th>Kelas</th>
        <th>Mapel</th>
        <th>Harian</th>
        <th>UTS</th>
        <th>UAS</th>
        <th>Rata - rata</th>
      </tr>
  `;

  siswaList.forEach((s) => {
    let nilai =
      state.dataNilai.find((n) => n.nisn === s.nisn && n.mapel === mapel) || {};

    html += `
      <tr>
        <td>${s.nama}</td>
        <td>${s.kelas}</td>
        <td>${mapel}</td>

        <td><input type="number" min="0" max="100" value="${nilai.harian || ""}"
          oninput="handleInputNilai(this, '${s.nisn}', 'harian')"></td>

        <td><input type="number" min="0" max="100" value="${nilai.uts || ""}"
          oninput="handleInputNilai(this, '${s.nisn}','uts')"></td>

        <td><input type="number" min="0" max="100" value="${nilai.uas || ""}"
          oninput="handleInputNilai(this, '${s.nisn}','uas')"></td>

        <td>${nilai.rata || "-"}</td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("tableNilai").innerHTML = html;
}

function validateNilai(input) {
  let value = Number(input.value);

  if (value > 100) input.value = 100;
  if (value < 0) input.value = 0;
}
// =======================
// UPDATE NILAI
// =======================
function updateNilai(nisn, field, value) {
  let mapel = document.getElementById("filterMapelNilai").value;
  if (!mapel) return;

  // 🔥 double safety
  value = Math.max(0, Math.min(100, Number(value)));

  let nilai = state.dataNilai.find((n) => n.nisn === nisn && n.mapel === mapel);

  if (!nilai) {
    nilai = { nisn, mapel, harian: 0, uts: 0, uas: 0, rata: 0 };
    state.dataNilai.push(nilai);
  }

  nilai[field] = value;

  nilai.rata = Math.round((nilai.harian + nilai.uts + nilai.uas) / 3);

  saveNilai();
}

function handleInputNilai(input, nisn, field) {
  let value = Number(input.value);

  // 🔥 VALIDASI KERAS
  if (value > 100) value = 100;
  if (value < 0) value = 0;

  input.value = value;

  updateNilai(nisn, field, value);
}

window.handleInputNilai = handleInputNilai;

function renderStatistikNilai() {
  let kelas = document.getElementById("filterKelasNilai").value;
  let mapel = document.getElementById("filterMapelNilai").value;

  let data = state.dataNilai.filter((n) => {
    let siswa = state.dataSiswa.find((s) => s.nisn === n.nisn);
    return siswa && siswa.kelas === kelas && n.mapel === mapel;
  });

  if (data.length === 0) return;

  let total = data.reduce((acc, n) => acc + n.rata, 0);
  let avg = Math.round(total / data.length);

  document.getElementById("avgKelas").innerText = avg;

  document.getElementById("predikatKelas").innerText =
    avg >= 85
      ? "Sangat Baik"
      : avg >= 75
        ? "Baik"
        : avg >= 65
          ? "Cukup"
          : "Kurang";

  let max = data.reduce((a, b) => (a.rata > b.rata ? a : b));
  let min = data.reduce((a, b) => (a.rata < b.rata ? a : b));

  let siswaMax = state.dataSiswa.find((s) => s.nisn === max.nisn);
  let siswaMin = state.dataSiswa.find((s) => s.nisn === min.nisn);

  document.getElementById("nilaiTertinggi").innerText = max.rata;
  document.getElementById("namaTertinggi").innerText = siswaMax?.nama || "-";

  document.getElementById("nilaiTerendah").innerText = min.rata;
  document.getElementById("namaTerendah").innerText = siswaMin?.nama || "-";
}

function handleTampilkanNilai() {
  const kelas = document.getElementById("filterKelasNilai").value;
  const mapel = document.getElementById("filterMapelNilai").value;

  if (!kelas || !mapel) {
    alert("Pilih kelas dan mata pelajaran dulu!");
    return;
  }

  renderNilai();
  renderStatistikNilai();

  document.getElementById("statCard").style.display = "flex";
}

function saveNilai() {
  localStorage.setItem("dataNilai", JSON.stringify(state.dataNilai));
}

function handleSimpanNilai() {
  saveNilai();
  renderStatistikNilai();
  renderNilai();

  console.log("Data tersimpan");
}

function exportExcel() {
  let kelas = document.getElementById("filterKelasNilai").value;
  let mapel = document.getElementById("filterMapelNilai").value;

  if (!kelas || !mapel) {
    alert("Pilih kelas dan mata pelajaran dulu!");
    return;
  }

  // 🔥 ambil data sesuai filter
  let data = state.dataNilai.filter((n) => {
    let siswa = state.dataSiswa.find((s) => s.nisn === n.nisn);
    return siswa && siswa.kelas === kelas && n.mapel === mapel;
  });

  if (data.length === 0) {
    alert("Belum ada data nilai!");
    return;
  }

  // 🔥 format data untuk Excel
  let exportData = data.map((n, index) => {
    let siswa = state.dataSiswa.find((s) => s.nisn === n.nisn);

    return {
      No: index + 1,
      Nama: siswa?.nama || "-",
      Kelas: siswa?.kelas || "-",
      Mapel: n.mapel,
      Harian: n.harian,
      UTS: n.uts,
      UAS: n.uas,
      Rata: n.rata,
    };
  });

  // 🔥 buat worksheet

  const worksheet = XLSX.utils.json_to_sheet(exportData, {
    header: ["No", "Nama", "Kelas", "Mapel", "Harian", "UTS", "UAS", "Rata"],
  });

  // 🔥 buat workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nilai Siswa");

  // 🔥 download file
  XLSX.writeFile(workbook, `Nilai_${kelas}_${mapel}.xlsx`);
}

window.exportExcel = exportExcel;

// 🔥 WAJIB INI
window.handleSimpanNilai = handleSimpanNilai;
window.exportExcel = exportExcel;
// =======================
// EXPORT
// =======================
window.renderNilai = renderNilai;
window.updateNilai = updateNilai;

let currentPageSiswa = 1;
const dataPerPageSiswa = 12;
let currentDataSiswa = [];
const penghasilanMap = {
  1: { label: "< 1.000.000", bobot: 4 },
  2: { label: "1.000.000 - 2.000.000", bobot: 3 },
  3: { label: "2.000.000 - 3.000.000", bobot: 2 },
  4: { label: "> 3.000.000", bobot: 1 },
};

// =======================
// RENDER TABLE / CARD
// =======================
function renderTableSiswa(data) {
  const container = document.getElementById("gridSiswa");
  if (!container) return;

  let start = (currentPageSiswa - 1) * dataPerPageSiswa;
  let end = start + dataPerPageSiswa;
  let pageData = data.slice(start, end);

  let html = "";

  pageData.forEach((s) => {
    html += `
    <div class="col-md-4 col-lg-3">
      <div class="card p-3 text-center shadow-sm h-100">

        <div class="avatar mb-2">${(s.nama || "?").charAt(0)}</div>

        <h6 class="mb-1">${s.nama}</h6>
        <small class="text-muted">${s.kelas}</small>

        <span class="badge mt-2 ${s.jk === "L" ? "bg-primary" : "bg-pink"}">
          ${s.jk === "L" ? "Laki-laki" : "Perempuan"}
        </span>

        <div class="mt-3 d-flex justify-content-center gap-2">
          <button class="btn btn-warning btn-sm"
            onclick="openFormByNISN('${s.nisn}')">Edit</button>

          <button class="btn btn-danger btn-sm"
            onclick="deleteData('${s.nisn}')">Hapus</button>
        </div>

      </div>
    </div>
    `;
  });

  container.innerHTML = html;

  renderPaginationSiswa(data.length);
}
function renderPaginationSiswa(totalData) {
  let totalPage = Math.ceil(totalData / dataPerPageSiswa);

  document.getElementById("pageInfoSiswa").innerText =
    `Halaman ${currentPageSiswa} dari ${totalPage}`;
}

function nextPageSiswa() {
  let totalPage = Math.ceil(currentDataSiswa.length / dataPerPageSiswa);

  if (currentPageSiswa < totalPage) {
    currentPageSiswa++;
    renderTableSiswa(currentDataSiswa);
  }
}

function prevPageSiswa() {
  if (currentPageSiswa > 1) {
    currentPageSiswa--;
    renderTableSiswa(currentDataSiswa);
  }
}

window.nextPageSiswa = nextPageSiswa;
window.prevPageSiswa = prevPageSiswa;
// =======================
// LOAD FILTER KELAS
// =======================
function loadFilterKelas() {
  let select = document.getElementById("filterKelas");
  if (!select) return;

  let html = `<option value="">Semua Kelas</option>`;

  for (let i = 1; i <= 6; i++) {
    html += `<option>${i}A</option>`;
    html += `<option>${i}B</option>`;
    html += `<option>${i}C</option>`;
  }

  select.innerHTML = html;
}

// =======================
// RENDER PAGE
// =======================
function renderSiswaPage() {
  loadFilterKelas();

  // restore UI
  const select = document.getElementById("filterKelas");
  if (select) select.value = state.filterKelas || "";

  const search = document.getElementById("searchSiswa");
  if (search) search.value = state.searchKeyword || "";

  // 🔥 WAJIB render ulang
  renderSiswa();
}

function renderSiswa() {
  let data = [...state.dataSiswa];

  const keyword = state.searchKeyword || "";
  const kelas = state.filterKelas || "";

  if (keyword) {
    data = data.filter((s) =>
      (s.nama || "").toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  if (kelas) {
    data = data.filter((s) => s.kelas === kelas);
  }

  // 🔥 SIMPAN GLOBAL
  currentDataSiswa = data;
  currentPageSiswa = 1;

  renderTableSiswa(currentDataSiswa);
}
// =======================
// FORM TAMBAH
// =======================
function openForm() {
  document.getElementById("nisn").value = "";
  document.getElementById("nama").value = "";
  document.getElementById("kelas").value = "";
  document.getElementById("ortu").value = "";
  document.getElementById("jk").value = "";
  document.getElementById("penghasilan").value = "";
  document.getElementById("rumah").value = "Milik Sendiri";
  document.getElementById("tanggungan").value = "";

  window.editNISN = null;

  new bootstrap.Modal(document.getElementById("modalForm")).show();
}

// =======================
// FORM EDIT
// =======================
function openFormByNISN(nisn) {
  // simpan data yang mau diedit
  window.editNISN = nisn;

  // pindah ke halaman form dulu
  loadPage("siswa-form");
}

function fillFormEdit() {
  if (!window.editNISN) return;

  const s = state.dataSiswa.find((x) => x.nisn === window.editNISN);
  if (!s) return;

  document.getElementById("nisn").value = s.nisn;
  document.getElementById("nama").value = s.nama;
  document.getElementById("kelas").value = s.kelas;
  document.getElementById("ortu").value = s.ortu;
  document.getElementById("jk").value = s.jk;
  document.getElementById("rumah").value = s.rumah;

  // mapping balik penghasilan ke select
  const key = Object.keys(penghasilanMap).find(
    (k) => penghasilanMap[k].label === s.penghasilan,
  );
  document.getElementById("penghasilan").value = key || "";
}

window.fillFormEdit = fillFormEdit;

window.openFormByNISN = openFormByNISN;

// =======================
// DELETE
// =======================
function deleteData(nisn) {
  if (!confirm("Yakin mau hapus?")) return;

  state.dataSiswa = state.dataSiswa.filter((s) => s.nisn !== nisn);
  saveToStorage();

  alert("Data berhasil dihapus!"); // 🔥 tambah ini

  renderSiswa();
}
// =======================
// SAVE DATA (FIX TOTAL)
// =======================
function saveData() {
  const nisn = document.getElementById("nisn").value.trim();
  const nama = document.getElementById("nama").value;
  const jk = document.getElementById("jk").value;
  const kelas = document.getElementById("kelas").value;
  const ortu = document.getElementById("ortu").value;
  const penghasilan = document.getElementById("penghasilan").value;
  const rumah = document.getElementById("rumah").value;
  const tanggungan = document.getElementById("tanggungan").value;

  // VALIDASI
  if (!nisn) {
    alert("NISN wajib diisi!");
    return;
  }

  if (nisn.length !== 10) {
    alert("NISN harus 10 digit!");
    return;
  }

  const isExist = state.dataSiswa.some(
    (s) => s.nisn === nisn && s.nisn !== window.editNISN,
  );

  if (isExist) {
    alert("NISN sudah digunakan!");
    return;
  }

  if (window.editNISN) {
    let s = state.dataSiswa.find((x) => x.nisn === window.editNISN);
    if (s) {
      s.nisn = nisn;
      s.nama = nama;
      s.kelas = kelas;
      s.ortu = ortu;
      s.jk = jk;
      s.penghasilan = penghasilan;
      s.rumah = rumah;
      s.tanggungan = tanggungan;
    }
  } else {
    state.dataSiswa.push({
      nisn,
      nama,
      kelas,
      ortu,
      jk,
      penghasilan,
      rumah,
      tanggungan,
    });
  }

  renderSiswa();

  bootstrap.Modal.getInstance(document.getElementById("modalForm")).hide();
}

// =======================
// VALIDASI INPUT
// =======================
function validateNISN(input) {
  input.value = input.value.replace(/\D/g, "").slice(0, 10);
}

function checkNISN(input) {
  const warning = document.getElementById("nisnWarning");
  const nisn = input.value.trim();

  const isExist = state.dataSiswa.some(
    (s) => s.nisn === nisn && s.nisn !== window.editNISN,
  );

  if (nisn.length !== 10) {
    input.classList.add("is-invalid");
    if (warning) {
      warning.innerText = "NISN harus 10 digit angka";
      warning.style.display = "block";
    }
    return;
  }

  if (isExist) {
    input.classList.add("is-invalid");
    if (warning) {
      warning.innerText = "NISN sudah digunakan";
      warning.style.display = "block";
    }
  } else {
    input.classList.remove("is-invalid");
    if (warning) warning.style.display = "none";
  }
}

function formatRupiah(input) {
  let angka = input.value.replace(/\D/g, "");
  input.value = new Intl.NumberFormat("id-ID").format(angka);
}

function handleFilterChange() {
  state.filterKelas = document.getElementById("filterKelas").value;
  renderSiswa();
}
window.handleFilterChange = handleFilterChange;

function handleSearch() {
  state.searchKeyword = document.getElementById("searchSiswa").value;
  renderSiswa();
}
window.handleSearch = handleSearch;

function saveDataForm() {
  const nisn = document.getElementById("nisn").value.trim();
  const nama = document.getElementById("nama").value;
  const kelas = document.getElementById("kelas").value;
  const ortu = document.getElementById("ortu").value;
  const jk = document.getElementById("jk").value;

  const penghasilan = Number(document.getElementById("penghasilan").value);
  const rumah = Number(document.getElementById("rumah").value);

  const isEdit = !!window.editNISN;

  // =====================
  // ✅ VALIDASI
  // =====================
  if (nisn.length !== 10 || isNaN(nisn)) {
    alert("NISN harus 10 digit angka!");
    return;
  }

  if (!nama || !kelas) {
    alert("Nama dan kelas wajib diisi!");
    return;
  }

  if (!penghasilan || !rumah) {
    alert("Harap pilih penghasilan dan status rumah!");
    return;
  }

  // 🔥 FIX: gunakan penghasilan langsung (angka)
  const penghasilanData = penghasilanMap[penghasilan];

  // =====================
  // ✏️ MODE EDIT
  // =====================
  if (isEdit) {
    const index = state.dataSiswa.findIndex((s) => s.nisn === window.editNISN);

    if (index === -1) return;

    const isExist = state.dataSiswa.some(
      (s) => s.nisn === nisn && s.nisn !== window.editNISN,
    );

    if (isExist) {
      alert("NISN sudah digunakan!");
      return;
    }

    state.dataSiswa[index] = {
      ...state.dataSiswa[index],
      nisn,
      nama,
      kelas,
      ortu,
      jk,
      rumah,
      penghasilan: penghasilan, // 🔥 FIX (angka)
      penghasilanLabel: penghasilanData.label, // tambahan (biar UI tetap bagus)
    };

    window.editNISN = null;
  } else {
    // =====================
    // ➕ MODE TAMBAH
    // =====================
    const isExist = state.dataSiswa.some((s) => s.nisn === nisn);

    if (isExist) {
      alert("NISN sudah digunakan!");
      return;
    }

    state.dataSiswa.push({
      nisn,
      nama,
      kelas,
      ortu,
      jk,
      rumah,
      penghasilan: penghasilan, // 🔥 FIX (angka)
      penghasilanLabel: penghasilanData.label, // tambahan
    });
  }

  // =====================
  // 🔥 FIX UX (INI KUNCI)
  // =====================
  state.filterKelas = kelas;
  state.searchKeyword = "";

  // =====================
  // 🔄 PINDAH HALAMAN
  // =====================
  saveToStorage();
  alert(isEdit ? "Data berhasil di edit!" : "Data berhasil di input!");
  loadPage("siswa");
}

function saveToStorage() {
  localStorage.setItem("dataSiswa", JSON.stringify(state.dataSiswa));
}

function loadFromStorage() {
  const data = localStorage.getItem("dataSiswa");
  if (data) {
    state.dataSiswa = JSON.parse(data);
  }
}
// ❗ cukup 1x saja
window.saveDataForm = saveDataForm;
// =======================
// EXPORT GLOBAL
// =======================
window.openForm = openForm;
window.openFormByNISN = openFormByNISN;
window.deleteData = deleteData;
window.saveData = saveData;
window.validateNISN = validateNISN;
window.checkNISN = checkNISN;
window.formatRupiah = formatRupiah;

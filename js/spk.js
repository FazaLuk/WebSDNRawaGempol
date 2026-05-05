let currentDataSPK = [];
let currentPageSPK = 1;
const dataPerPage = 10;
function handleSPK() {
  let kelas = document.getElementById("kelasSPK").value;
  let rumah = document.getElementById("rumahSPK").value;
  let penghasilan = document.getElementById("penghasilanSPK").value;

  let data = state.dataSiswa;

  // 🔥 FILTER KELAS
  if (kelas) {
    data = data.filter((s) => s.kelas === kelas);
  }

  // 🔥 FILTER RUMAH (ANGKA)
  if (rumah) {
    data = data.filter((s) => String(s.rumah) === rumah);
  }

  // 🔥 FILTER PENGHASILAN (ANGKA)
  if (penghasilan) {
    data = data.filter((s) => String(s.penghasilan) === penghasilan);
  }

  let hasil = data.map((s) => ({
    ...s,
    penghasilan: Number(s.penghasilan),
    rumah: Number(s.rumah),
  }));

  // 🔥 MAX
  // 🔥 ambil dari SEMUA DATA, bukan hasil filter
  let maxPenghasilan = Math.max(
    ...state.dataSiswa.map((s) => Number(s.penghasilan) || 1),
  );

  let maxRumah = Math.max(...state.dataSiswa.map((s) => Number(s.rumah) || 1));

  // 🔥 HITUNG SAW
  hasil = hasil.map((s) => {
    let rPenghasilan = s.penghasilan / maxPenghasilan;
    let rRumah = s.rumah / maxRumah;

    let skor = rPenghasilan * 0.6 + rRumah * 0.4;

    skor = (skor * 100).toFixed(1);

    let status = skor >= 70 ? "Tinggi" : skor >= 50 ? "Sedang" : "Rendah";

    return { ...s, skor, status };
  });

  // SORT
  hasil.sort((a, b) => b.skor - a.skor);

  // 🔥 INI YANG PENTING
  currentDataSPK = hasil;
  currentPageSPK = 1;

  renderSPK(currentDataSPK); // ✅ FIX
  renderCard(currentDataSPK);
}

function getLabelPenghasilan(val) {
  return (
    {
      4: "< 1jt",
      3: "1-2jt",
      2: "2-3jt",
      1: "> 3jt",
    }[val] || "-"
  );
}

function getLabelRumah(val) {
  return (
    {
      5: "Menumpang",
      4: "Kontrak",
      1: "Milik Sendiri",
    }[val] || "-"
  );
}
// ==========================
// TABLE
// ==========================
function renderSPK(data) {
  let table = document.getElementById("tableSPK");
  if (!table) return;

  // 🔥 HITUNG DATA PER HALAMAN
  let start = (currentPageSPK - 1) * dataPerPage;
  let end = start + dataPerPage;
  let pageData = data.slice(start, end);

  let html = "";

  pageData.forEach((s, i) => {
    let warna =
      s.status === "Tinggi"
        ? "red"
        : s.status === "Sedang"
          ? "orange"
          : "green";

    let warnaSkor = s.skor >= 75 ? "red" : s.skor >= 50 ? "orange" : "green";

    html += `
      <tr>
        <td>${start + i + 1}</td>
        <td>${s.nama}</td>
        <td>${getLabelRumah(s.rumah)}</td>
        <td>${getLabelPenghasilan(s.penghasilan)}</td>
        <td style="color:${warnaSkor}; font-weight:bold;">
  ${s.skor}
</td>
        <td style="color:${warna}; font-weight:bold;">
          ${s.status}
        </td>
      </tr>
    `;
  });

  table.innerHTML = html;

  renderPagination(data.length);
}

// ==========================
// CARD
// ==========================
function renderCard(data) {
  let tinggi = 0,
    sedang = 0,
    rendah = 0;

  data.forEach((s) => {
    if (s.status === "Tinggi") tinggi++;
    else if (s.status === "Sedang") sedang++;
    else rendah++;
  });

  document.getElementById("totalSiswa").innerText = data.length;
  document.getElementById("prioritasTinggi").innerText = tinggi;
  document.getElementById("prioritasSedang").innerText = sedang;
  document.getElementById("prioritasRendah").innerText = rendah;
}
function renderPagination(totalData) {
  let totalPage = Math.ceil(totalData / dataPerPage);

  document.getElementById("pageInfo").innerText =
    `Halaman ${currentPageSPK} dari ${totalPage}`;
}

function nextPage() {
  let totalPage = Math.ceil(currentDataSPK.length / dataPerPage);

  if (currentPageSPK < totalPage) {
    currentPageSPK++;
    renderSPK(currentDataSPK);
  }
}

function prevPage() {
  if (currentPageSPK > 1) {
    currentPageSPK--;
    renderSPK(currentDataSPK);
  }
}

window.handleSPK = handleSPK;
window.nextPage = nextPage;
window.prevPage = prevPage;

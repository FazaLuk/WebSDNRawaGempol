// ===============================
// MAIN
// ===============================
function renderDashboard() {
  renderTotalSiswa();
  renderStatistik();
  renderBelumAbsen();
  renderChartAbsensi();
  renderChartKelas();
  renderPerhatian();
  renderTopSPK();
  renderTopNilai();
  updateLabelPeriode();
  updateTanggalLabel();

  // default tanggal
  let input = document.getElementById("filterTanggal");
  if (input && !input.value) {
    input.value = new Date().toISOString().split("T")[0];
  }
}

// ===============================
// FILTER HELPER
// ===============================
function getSelectedKelas() {
  return document.getElementById("filterKelas")?.value || "semua";
}

function getSelectedTanggal() {
  return document.getElementById("filterTanggal")?.value;
}

function getSelectedPeriode() {
  return document.getElementById("filterPeriode")?.value || "harian";
}

// ===============================
// FILTER DATA
// ===============================
function getFilteredSiswa() {
  let kelas = getSelectedKelas();

  if (kelas === "semua") return state.dataSiswa;

  return state.dataSiswa.filter((s) => s.kelas === kelas);
}

function getFilteredKehadiranByPeriode() {
  let kelas = getSelectedKelas();
  let tanggal = getSelectedTanggal();
  let periode = getSelectedPeriode();

  if (!tanggal) return [];

  let selectedDate = new Date(tanggal);

  // hitung range minggu
  let day = selectedDate.getDay();
  let diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1);

  let start = new Date(selectedDate);
  start.setDate(diff);

  let end = new Date(start);
  end.setDate(start.getDate() + 6);

  return state.dataKehadiran.filter((k) => {
    let tgl = new Date(k.tanggal);

    // filter kelas
    if (kelas !== "semua") {
      let siswa = state.dataSiswa.find((s) => s.nisn === k.nisn);
      if (!siswa || siswa.kelas !== kelas) return false;
    }

    // filter periode
    if (periode === "harian") {
      return k.tanggal === tanggal;
    }

    if (periode === "mingguan") {
      return tgl >= start && tgl <= end;
    }

    if (periode === "bulanan") {
      return (
        tgl.getMonth() === selectedDate.getMonth() &&
        tgl.getFullYear() === selectedDate.getFullYear()
      );
    }

    return true;
  });
}

// ===============================
// TOTAL
// ===============================
function renderTotalSiswa() {
  setText("totalSiswa", getFilteredSiswa().length);
}

// ===============================
// STATISTIK
// ===============================
function renderStatistik() {
  let data = getFilteredKehadiranByPeriode();

  let hadir = 0,
    izin = 0,
    sakit = 0,
    alpha = 0;

  data.forEach((k) => {
    if (k.status === "Hadir") hadir++;
    else if (k.status === "Izin") izin++;
    else if (k.status === "Sakit") sakit++;
    else alpha++;
  });

  setText("statHadir", hadir);
  setText("statIzin", izin);
  setText("statSakit", sakit);
  setText("statAlpha", alpha);
}

// ===============================
// BELUM ABSEN
// ===============================
function renderBelumAbsen() {
  let tanggal = getSelectedTanggal();
  if (!tanggal) return;

  let siswa = getFilteredSiswa();

  let belum = siswa.filter(
    (s) =>
      !state.dataKehadiran.some(
        (k) => k.nisn === s.nisn && k.tanggal === tanggal,
      ),
  );

  setText("statBelum", belum.length);
}

// ===============================
// CHART ABSENSI
// ===============================
function renderChartAbsensi() {
  let data = getFilteredKehadiranByPeriode();

  let hadir = 0,
    izin = 0,
    sakit = 0,
    alpha = 0;

  data.forEach((k) => {
    if (k.status === "Hadir") hadir++;
    else if (k.status === "Izin") izin++;
    else if (k.status === "Sakit") sakit++;
    else alpha++;
  });

  let total = hadir + izin + sakit + alpha;

  let canvas = document.getElementById("chartAbsensi");
  let empty = document.getElementById("emptyAbsensi");

  // 🔥 kalau tidak ada data
  if (total === 0) {
    if (window.chartAbsensi instanceof Chart) {
      window.chartAbsensi.destroy();
    }

    canvas.style.display = "none";
    empty.style.display = "block";
    return;
  }

  // 🔥 kalau ada data
  canvas.style.display = "block";
  empty.style.display = "none";

  renderChart(
    "chartAbsensi",
    "pie",
    ["Hadir", "Izin", "Sakit", "Alpha"],
    [hadir, izin, sakit, alpha],
    ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444"],
  );
}

// ===============================
// CHART KELAS
// ===============================
function renderChartKelas() {
  let data = getFilteredSiswa();

  let kelasCount = {};

  data.forEach((s) => {
    kelasCount[s.kelas] = (kelasCount[s.kelas] || 0) + 1;
  });

  let labels = Object.keys(kelasCount);
  let values = Object.values(kelasCount);

  if (labels.length === 0) {
    labels = ["Tidak ada data"];
    values = [0];
  }

  renderChart(
    "chartKelas",
    "bar",
    labels,
    values,
    "#4e73df", // 🔥 satu warna
  );
}

// ===============================
// SISWA PERLU PERHATIAN
// ===============================
function renderPerhatian() {
  let container = document.getElementById("peringatanSiswa");
  if (!container) return;

  let data = getFilteredKehadiranByPeriode();
  let siswa = getFilteredSiswa();

  let hasil = siswa.map((s) => {
    let alpha = data.filter(
      (k) => k.nisn === s.nisn && k.status === "Alpha",
    ).length;

    let sakit = data.filter(
      (k) => k.nisn === s.nisn && k.status === "Sakit",
    ).length;

    return {
      ...s,
      alpha,
      sakit,
    };
  });

  // ambil yang bermasalah
  let filtered = hasil.filter((s) => s.alpha >= 3 || s.sakit >= 3);

  // render
  container.innerHTML = filtered.length
    ? filtered
        .map((s) => {
          let ket = [];

          if (s.alpha >= 3) ket.push(`Alpha ${s.alpha}x`);
          if (s.sakit >= 3) ket.push(`Sakit ${s.sakit}x`);

          return `
            <div style="margin-bottom:8px">
              ⚠ <b>${s.nama}</b><br>
              <small style="color:#888">${ket.join(", ")}</small>
            </div>
          `;
        })
        .join("")
    : "<small style='color:green'>Aman</small>";
}

// ===============================
// SPK
// ===============================
function renderTopSPK() {
  let container = document.getElementById("topSPK");
  if (!container) return;

  let data = getFilteredSiswa();

  let maxP = Math.max(...data.map((s) => s.penghasilan || 1));
  let maxR = Math.max(...data.map((s) => s.rumah || 1));

  let hasil = data.map((s) => {
    let skor = (s.penghasilan / maxP) * 0.6 + (s.rumah / maxR) * 0.4;
    return { ...s, skor: (skor * 100).toFixed(1) };
  });

  hasil.sort((a, b) => b.skor - a.skor);

  container.innerHTML = hasil
    .slice(0, 5)
    .map(
      (s, i) => `
      <div>
        <b>${i + 1}. ${s.nama}</b><br>
        <small>${s.kelas} | Skor: ${s.skor}</small>
      </div>
    `,
    )
    .join("");
}

// ===============================
// TOP NILAI
// ===============================
function renderTopNilai() {
  let map = {};

  state.dataNilai.forEach((n) => {
    if (!map[n.nisn]) map[n.nisn] = [];
    map[n.nisn].push(n.rata);
  });

  let hasil = Object.keys(map).map((nisn) => {
    let avg = map[nisn].reduce((a, b) => a + b, 0) / map[nisn].length;
    let siswa = state.dataSiswa.find((s) => s.nisn === nisn);

    return { nama: siswa?.nama || "-", rata: avg };
  });

  hasil.sort((a, b) => b.rata - a.rata);

  renderChart(
    "chartNilai",
    "bar",
    hasil.slice(0, 5).map((s) => s.nama),
    hasil.slice(0, 5).map((s) => s.rata),
    [
      // 🔥 warna beda-beda
      "#ee4035",
      "#f37736",
      "#e7db50",
      "#7bc043",
      "#0392cf",
    ],
  );
}

// ===============================
// CHART UNIVERSAL
// ===============================
function renderChart(id, type, labels, data, customColor = null) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (window[id] instanceof Chart) {
    window[id].destroy();
  }

  window[id] = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [
        {
          label: "Jumlah",
          data,
          backgroundColor: customColor || "#4e73df", // 🔥 kunci
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// ===============================
// UTIL
// ===============================
function setText(id, val) {
  let el = document.getElementById(id);
  if (el) el.innerText = val;
}

function updateTanggalLabel() {
  let el = document.getElementById("tanggalLabel");
  if (!el) return; // 🔥 biar tidak error

  let tgl = getSelectedTanggal();
  if (!tgl) return;

  el.innerText = new Date(tgl).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function updateLabelPeriode() {
  let periode = getSelectedPeriode();
  let tanggal = getSelectedTanggal();
  if (!tanggal) return;

  let d = new Date(tanggal);
  let label = "";

  if (periode === "harian") {
    label = d.toLocaleDateString("id-ID");
  }

  if (periode === "mingguan") {
    let start = new Date(d);
    start.setDate(d.getDate() - 6);

    label =
      start.toLocaleDateString("id-ID") + " - " + d.toLocaleDateString("id-ID");
  }

  if (periode === "bulanan") {
    label = d.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  }

  document.getElementById("labelPeriode").innerText = label;
}

// ===============================
// BUTTON
// ===============================
function refreshDashboard() {
  renderDashboard();
}

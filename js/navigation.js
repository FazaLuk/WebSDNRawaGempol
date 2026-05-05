function pilihSiswa(kelas) {
  state.currentKelas = kelas;
  showPage("siswa");
}

window.pilihKehadiran = function (kelas) {
  state.currentKelas = kelas;
  showPage("kehadiran");
};

window.toggleMenu = function (id) {
  let el = document.getElementById(id);
  if (!el) return;

  el.style.display = el.style.display === "block" ? "none" : "block";
};

window.onload = function () {
  loadFromStorage(); // ✅ ambil data dulu
  loadNilai();
  loadPage("dashboard");
};

function loadPage(page) {
  fetch(`components/${page}.html`)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;

      if (page === "dashboard") renderDashboard();
      if (page === "siswa-form") fillFormEdit();
      if (page === "siswa") renderSiswaPage();
      if (page === "kehadiran") loadKehadiran();
      // if (page === "spk") handleSPK();
      if (page === "rekap") renderRekap();
      if (page === "nilai") renderNilai();
    });
}

window.loadPage = loadPage;

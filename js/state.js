window.state = {
  dataSiswa: [],
  dataNilai: [],
  dataKehadiran: [],

  currentKelas: null,
  filterKelas: "",
  searchKeyword: "",
  currentTanggal: new Date().toISOString().split("T")[0],
};

// LOAD DATA
function loadFromStorage() {
  const siswa = localStorage.getItem("dataSiswa");
  const nilai = localStorage.getItem("dataNilai");

  if (siswa) state.dataSiswa = JSON.parse(siswa);
  if (nilai) state.dataNilai = JSON.parse(nilai);
}

// SAVE DATA
function saveNilai() {
  localStorage.setItem("dataNilai", JSON.stringify(state.dataNilai));
}

function loadNilai() {
  const data = localStorage.getItem("dataNilai");
  if (data) {
    state.dataNilai = JSON.parse(data);
  }
}

window.renderRekap = function () {
  let el = document.getElementById("rekap");
  if (!el) return;

  let html = `
    <h3>Rekap Absensi</h3>
    <table border="1" cellpadding="5">
      <tr>
        <th>Nama</th>
        <th>Kelas</th>
        <th>Hadir</th>
        <th>Izin</th>
        <th>Sakit</th>
        <th>Alpha</th>
      </tr>
  `;

  state.dataSiswa.forEach((s) => {
    let hadir = 0,
      izin = 0,
      sakit = 0,
      alpha = 0;

    state.dataKehadiran.forEach((k) => {
      if (k.nisn === s.nisn) {
        if (k.status === "Hadir") hadir++;
        else if (k.status === "Izin") izin++;
        else if (k.status === "Sakit") sakit++;
        else alpha++;
      }
    });

    html += `
      <tr>
        <td>${s.nama}</td>
        <td>${s.kelas}</td>
        <td>${hadir}</td>
        <td>${izin}</td>
        <td>${sakit}</td>
        <td>${alpha}</td>
      </tr>
    `;
  });

  html += `</table>`;

  el.innerHTML = html;
};

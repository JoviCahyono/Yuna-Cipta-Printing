function searchTable() {
  // Ambil nilai dari input pencarian
  var input = document.getElementById("searchInput");
  var filter = input.value.toLowerCase(); // Konversi menjadi huruf kecil untuk pencarian case-insensitive
  var table = document.querySelector("table");
  var rows = table.getElementsByTagName("tr"); // Ambil semua baris dalam tabel

  // Loop melalui semua baris dan sembunyikan yang tidak sesuai dengan pencarian
  for (var i = 1; i < rows.length; i++) {
    // Mulai dari 1 untuk melewati header tabel
    var cells = rows[i].getElementsByTagName("td");
    var matchFound = false;

    // Loop melalui setiap kolom di baris
    for (var j = 0; j < cells.length; j++) {
      var cell = cells[j];
      if (cell) {
        if (cell.textContent.toLowerCase().indexOf(filter) > -1) {
          matchFound = true; // Jika ditemukan kecocokan, tandai baris ini
          break;
        }
      }
    }

    // Tampilkan atau sembunyikan baris berdasarkan kecocokan
    if (matchFound) {
      rows[i].style.display = ""; // Tampilkan baris jika ada kecocokan
    } else {
      rows[i].style.display = "none"; // Sembunyikan baris jika tidak ada kecocokan
    }
  }
}

function sortByName(direction) {
  const table = document.querySelector("table");
  const rows = Array.from(table.rows).slice(1); // Ambil semua baris kecuali header

  rows.sort((rowA, rowB) => {
    const nameA = rowA.cells[1].textContent.trim(); // Nama Karyawan berada di kolom 1
    const nameB = rowB.cells[1].textContent.trim();

    // Urutkan berdasarkan nama
    let comparison = nameA.localeCompare(nameB);

    // Tentukan urutan (ascending atau descending)
    return direction === "asc" ? comparison : -comparison;
  });

  // Tambahkan baris yang sudah diurutkan ke dalam tabel
  rows.forEach((row) => table.appendChild(row));
}

// Mengaktifkan form upload ketika tombol Import Data ditekan
document.getElementById("importDataBtn").addEventListener("click", function () {
  document.getElementById("fileInput").click();
});

// Mengambil file yang di-upload dan memprosesnya
document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const rows = content.split("\n");

        // Parse CSV dan masukkan ke dalam tabel
        const tableBody = document.querySelector("table tbody");
        rows.forEach((row) => {
          const cols = row.split(",");
          if (cols.length > 1) {
            // Pastikan baris tidak kosong
            const newRow = document.createElement("tr");

            // Tambahkan setiap kolom ke dalam baris
            cols.forEach((col) => {
              const cell = document.createElement("td");
              cell.textContent = col.trim();
              newRow.appendChild(cell);
            });

            // Tambahkan baris ke dalam tabel
            tableBody.appendChild(newRow);
          }
        });
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  });

// Fungsi untuk memperbarui saldo kasbon atau kasbon motor
function updateKasbon() {
  const namaKaryawan = document.getElementById("nama").value; // Nama karyawan yang dipilih
  const kasbonDibayar = parseFloat(document.getElementById("kasbon").value); // Jumlah kasbon yang dibayar
  const kasbonMotorDibayar = parseFloat(
    document.getElementById("kasbonMotor").value
  ); // Jumlah kasbon motor yang dibayar

  // Ambil data karyawan yang ada (ini hanya contoh, sesuaikan dengan bagaimana data karyawan disimpan)
  const karyawan = getKaryawanData(namaKaryawan); // Fungsi ini akan mengambil data karyawan berdasarkan nama

  if (karyawan) {
    // Perbarui saldo kasbon dan kasbon motor
    const saldoKasbonBaru = karyawan.kasbon - kasbonDibayar;
    const saldoKasbonMotorBaru = karyawan.kasbonMotor - kasbonMotorDibayar;

    // Update data karyawan di UI dan database (contoh update UI)
    document.getElementById("saldoKasbon").innerText = saldoKasbonBaru;
    document.getElementById("saldoKasbonMotor").innerText =
      saldoKasbonMotorBaru;

    // Update database (perlu implementasi server-side untuk menyimpan perubahan ini)
    updateKaryawanData(namaKaryawan, saldoKasbonBaru, saldoKasbonMotorBaru); // Fungsi untuk update data di database
  } else {
    alert("Karyawan tidak ditemukan!");
  }
}

// Ambil elemen input hari kerja
const hariKerjaInput = document.getElementById("hariKerja");

// Fungsi untuk membatasi input agar tetap dalam rentang 1-7
hariKerjaInput.addEventListener("input", function () {
  let value = parseInt(hariKerjaInput.value);
  if (value < 1) {
    hariKerjaInput.value = 0; // Jika nilai kurang dari 1, atur menjadi 1
  } else if (value > 7) {
    hariKerjaInput.value = 7; // Jika nilai lebih dari 7, atur menjadi 7
  }
});

// Validasi input untuk Lembur Mingguan (1 - 7)
const lemburInput = document.getElementById("lembur");
lemburInput.addEventListener("input", function () {
  let value = parseInt(lemburInput.value);
  if (value < 1) {
    lemburInput.value = 0; // Jika nilai kurang dari 1, atur menjadi 1
  } else if (value > 7) {
    lemburInput.value = 7; // Jika nilai lebih dari 7, atur menjadi 7
  }
});

// Validasi input untuk Jam Lembur (1 - 24)
const jamLemburInput = document.getElementById("jamLembur");
jamLemburInput.addEventListener("input", function () {
  let value = parseInt(jamLemburInput.value);
  if (value < 1) {
    jamLemburInput.value = 0; // Jika nilai kurang dari 1, atur menjadi 1
  } else if (value > 24) {
    jamLemburInput.value = 24; // Jika nilai lebih dari 24, atur menjadi 24
  }
});

function logout() {
  // Kirim pesan ke main process untuk melakukan logout
  window.location.href = "login.html";
}


const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();

// Konfigurasi multer untuk unggah gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Set view engine ke EJS
app.set('view engine', 'ejs');

// Menggunakan public folder untuk file statis
app.use(express.static('public'));

// Halaman utama
app.get('/', (req, res) => {
  res.render('index', {
    originalImage: null,
    compressedImage: null,
    originalSize: null,
    compressedSize: null
  });
});


// Proses unggah gambar dan kompresi
app.post('/compress', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;
  const algorithm = req.body.algorithm;  // Algoritma kompresi dipilih user
  const outputOriginal = `public/uploads/original-${req.file.filename}`;
  const outputCompressed = `public/uploads/compressed-${req.file.filename}`;

  // Copy file original untuk perbandingan
  fs.copyFileSync(imagePath, outputOriginal);

  // Kompresi berdasarkan algoritma yang dipilih
  let quality = 70; // Default kualitas kompresi
  if (algorithm === 'dynamic') {
    quality = 40; // Simulasi untuk koneksi lambat
  }

  await sharp(imagePath)
    .jpeg({ quality: quality })
    .toFile(outputCompressed);

  // Kirim hasil kompresi kembali ke frontend
  res.render('index', {
    originalImage: `/uploads/original-${req.file.filename}`,
    compressedImage: `/uploads/compressed-${req.file.filename}`,
    originalSize: fs.statSync(outputOriginal).size,
    compressedSize: fs.statSync(outputCompressed).size,
  });
});

// Jalankan server di port 3000
app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});

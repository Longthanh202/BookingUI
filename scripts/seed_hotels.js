const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'db.json');

const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDb = (obj) => fs.writeFileSync(dbPath, JSON.stringify(obj, null, 2), 'utf8');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = (Math.random() * 16) | 0;
  const v = c === 'x' ? r : (r & 0x3) | 0x8;
  return v.toString(16);
});

const provinces = [
  'Hà Nội','Hồ Chí Minh','Đà Nẵng','Quảng Ninh','Khánh Hòa','Lâm Đồng','Kiên Giang','Cần Thơ','Hải Phòng','Bình Thuận','Bà Rịa-Vũng Tàu','Ninh Bình','Thanh Hóa','Quảng Nam','Thừa Thiên Huế','Nghệ An','Bình Dương','Hưng Yên','Phú Yên','Bình Định','Quảng Ngãi','Kon Tum','Gia Lai','Đắk Lắk','An Giang','Long An','Tiền Giang','Vĩnh Phúc','Nam Định','Hòa Bình'
];

const amenitiesPool = [
  'Wi-Fi miễn phí','Bể bơi','Ăn sáng miễn phí','Đỗ xe miễn phí','Spa','Gym','Nhận/trả phòng nhanh','Dịch vụ phòng 24/7','Bar','Nhà hàng','Két an toàn','Điều hòa','TV','Tivi','Máy sấy tóc'
];

const roomTypeNames = ['Phòng Standard','Phòng Superior','Phòng Deluxe','Phòng Family','Suite','Phòng Đôi','Phòng Đơn'];

function genImageUrl(city, idx) {
  const query = encodeURIComponent(city + ' hotel');
  return `https://source.unsplash.com/collection/190727/800x600?${query}&sig=${idx}`;
}

function makeHotel(i, city) {
  const id = uid();
  const name = `Khách Sạn ${city} ${i}`;
  const soSao = pick([3,4,4,5]);
  const numImages = rand(2,5);
  const images = Array.from({length: numImages}).map((_, idx) => ({ id: uid(), url: genImageUrl(city, i*10+idx) }));
  const tienIchCount = rand(3,6);
  const tienIchs = [];
  for (let t=0;t<tienIchCount;t++) {
    tienIchs.push({ id: uid(), tenTienIch: pick(amenitiesPool) });
  }

  const loaiPhongs = [];
  const phongs = [];
  const giaPhongs = [];
  const roomTypesCount = rand(2,4);
  for (let r=0;r<roomTypesCount;r++){
    const lpId = uid();
    const loai = pick(roomTypeNames) + (r===0? '':' ' + (r+1));
    const gia = rand(400000, 2500000);
    loaiPhongs.push({ id: lpId, khachSanId: id, tenLoaiPhong: loai, gia });
    // create 1-4 actual room instances per type
    const roomCount = rand(1,4);
    for (let k=0;k<roomCount;k++){
      const pId = uid();
      phongs.push({ id: pId, loaiPhongId: lpId, soPhong: String(rand(1,999)).padStart(3,'0'), trangThai: pick(['TRONG','DANG_SU_DUNG','DA_DON']) });
    }
    giaPhongs.push({ id: uid(), loaiPhongId: lpId, gia });
  }

  return {
    khachSan: {
      id,
      tenKhachSan: name,
      moTa: `Khách sạn ${name} tọa lạc tại ${city}. Tiện nghi đầy đủ, thích hợp cho du lịch và công tác.`,
      diaChi: `${rand(10,200)} Đường Chính, ${city}`,
      thanhPho: city,
      soSao,
      gioNhanPhong: '14:00',
      gioTraPhong: '12:00',
      trangThai: 'ACTIVE'
    },
    images,
    tienIchs,
    loaiPhongs,
    phongs,
    giaPhongs
  };
}

function seed() {
  const db = readDb();
  // ensure tables exist
  db.khachsans = db.khachsans || [];
  db.khachsanimages = db.khachsanimages || [];
  db.loaiphong = db.loaiphong || [];
  db.giaphong = db.giaphong || [];
  db.phong = db.phong || [];
  db.tienich = db.tienich || [];
  db.khachsan_tienich = db.khachsan_tienich || [];

  const existingCount = (db.khachsans || []).length;
  const target = 30;
  for (let i = 1; i <= target; i++){
    const city = provinces[(i-1) % provinces.length];
    const hotel = makeHotel(existingCount + i, city);

    db.khachsans.push(hotel.khachSan);
    // images
    hotel.images.forEach(img => db.khachsanimages.push({ id: img.id, khachSanId: hotel.khachSan.id, url: img.url }));
    // amenities (tienich)
    hotel.tienIchs.forEach(t => {
      const tid = uid();
      db.tienich.push({ id: tid, tenTienIch: t.tenTienIch });
      db.khachsan_tienich.push({ id: uid(), khachSanId: hotel.khachSan.id, tienIchId: tid });
    });
    // room types
    hotel.loaiPhongs.forEach(lp => db.loaiphong.push({ id: lp.id, khachSanId: lp.khachSanId, tenLoaiPhong: lp.tenLoaiPhong, gia: lp.gia }));
    // prices
    hotel.giaPhongs.forEach(gp => db.giaphong.push({ id: gp.id, loaiPhongId: gp.loaiPhongId, gia: gp.gia }));
    // rooms
    hotel.phongs.forEach(p => db.phong.push({ id: p.id, loaiPhongId: p.loaiPhongId, soPhong: p.soPhong, trangThai: p.trangThai }));
  }

  writeDb(db);
  console.log(`Seeded ${target} hotels into ${dbPath}`);
}

seed();

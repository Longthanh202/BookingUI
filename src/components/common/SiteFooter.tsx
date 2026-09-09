import React from 'react';

const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo và mô tả */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Stayro Travel</h2>
            <p className="text-gray-300">
              Khám phá và đặt phòng khách sạn dễ dàng với Stayro. Chúng tôi cung cấp dịch vụ đặt phòng chất lượng cao cho mọi nhu cầu du lịch của bạn.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white">Trang chủ</a></li>
              <li><a href="/rooms" className="text-gray-300 hover:text-white">Phòng</a></li>
              <li><a href="/hotels" className="text-gray-300 hover:text-white">Khách sạn</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Liên hệ</a></li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@stayrotravel.com</li>
              <li>Điện thoại: +84 123 456 789</li>
              <li>Địa chỉ: 123 Đường ABC, TP.HCM</li>
            </ul>
          </div>
        </div>

        {/* Mạng xã hội và bản quyền */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
            <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
            <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
          </div>
          <p className="text-gray-300 text-sm">
            © 2024 Stayro Travel. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
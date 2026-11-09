// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import emrService from '../services/emrService';
import EmrRecordList from '../components/emr/EmrRecordList';

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await emrService.getMedicalRecords();
      setRecords(res.data || []);
    } catch (err) {
      console.error('Error fetching medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sổ theo dõi sức khỏe thú cưng (EMR-02 / EMR-03)
            </span>
            <h1 className="text-xl sm:text-2xl font-bold mt-2">
              Hồ sơ bệnh án điện tử thú y
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Theo dõi chi tiết lịch sử thăm khám lâm sàng, kết quả xét nghiệm cận lâm sàng (máu, X-quang, siêu âm) và đơn thuốc điều trị.
            </p>
          </div>
        </div>
      </div>

      {/* Record List */}
      <EmrRecordList
        records={records}
        loading={loading}
        onRefresh={fetchRecords}
        title="Lịch sử khám bệnh & Kết quả cận lâm sàng"
        description="Xem toàn bộ các lần khám, chẩn đoán, sinh hiệu và kết quả xét nghiệm được đồng bộ từ Bệnh viện PHMS."
      />
    </div>
  );
};

export default MedicalRecordsPage;

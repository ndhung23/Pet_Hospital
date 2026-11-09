// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Search,
  Eye,
  Stethoscope,
  FlaskConical,
  Pill,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import EmrDetailModal from './EmrDetailModal';

const EmrRecordList = ({
  records = [],
  loading = false,
  onRefresh,
  title = 'Danh sách hồ sơ bệnh án (EMR)',
  description = 'Xem lịch sử thăm khám, kết quả cận lâm sàng và đơn thuốc điều trị.',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPet, setSelectedPet] = useState('ALL');
  const [activeModalRecord, setActiveModalRecord] = useState(null);

  // Extract unique pets from records
  const uniquePets = Array.from(
    new Set(records.map((r) => r.pet?.name).filter(Boolean))
  );

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vet?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || r.status === selectedStatus;

    const matchesPet =
      selectedPet === 'ALL' || r.pet?.name === selectedPet;

    return matchesSearch && matchesStatus && matchesPet;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'EXAMINATION_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Đã hoàn thành
          </span>
        );
      case 'WAITING_LAB_RESULT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 animate-pulse">
            <Clock className="w-3 h-3" />
            Chờ kết quả xét nghiệm
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            Đang khám
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* List Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>{title}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            )}
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700">
              Tổng số: {filteredRecords.length} hồ sơ
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo chẩn đoán, tên thú cưng, bác sĩ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Pet */}
          {uniquePets.length > 1 && (
            <div className="relative">
              <select
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700"
              >
                <option value="ALL">Tất cả thú cưng</option>
                {uniquePets.map((p) => (
                  <option key={p} value={p}>
                    Thú cưng: {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter Status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-700"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="WAITING_LAB_RESULT">Chờ kết quả xét nghiệm</option>
              <option value="EXAMINATION_COMPLETED">Khám xong (Hoàn tất)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Record List */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">
            Đang tải dữ liệu hồ sơ bệnh án...
          </p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">Chưa tìm thấy hồ sơ bệnh án</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Chưa có bệnh án nào phù hợp với bộ lọc hoặc thú cưng chưa có lượt thăm khám nào trước đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm sm:text-base">
                        {record.pet?.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({record.pet?.species} • {record.pet?.breed || 'Chưa rõ giống'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(record.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>Bác sĩ: <strong>{record.vet?.fullName || 'Bác sĩ trực'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  {getStatusBadge(record.status)}
                  <button
                    onClick={() => setActiveModalRecord(record)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem bệnh án (EMR-03)</span>
                  </button>
                </div>
              </div>

              {/* Diagnosis and Treatment preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Chẩn đoán chính
                  </span>
                  <p className="font-bold text-emerald-950 truncate">
                    {record.diagnosis}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Kế hoạch điều trị
                  </span>
                  <p className="text-slate-700 truncate">
                    {record.treatmentPlan}
                  </p>
                </div>
              </div>

              {/* Badges footer */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                {record.weight && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    Cân nặng: {record.weight} kg
                  </span>
                )}
                {record.temperature && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                    Nhiệt độ: {record.temperature} °C
                  </span>
                )}
                {record._count?.labOrders > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                    <FlaskConical className="w-3 h-3" />
                    {record._count.labOrders} xét nghiệm
                  </span>
                )}
                {record._count?.prescriptions > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                    <Pill className="w-3 h-3" />
                    {record._count.prescriptions} loại thuốc kê đơn
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for full EMR detail (EMR-03) */}
      <EmrDetailModal
        record={activeModalRecord}
        isOpen={!!activeModalRecord}
        onClose={() => setActiveModalRecord(null)}
      />
    </div>
  );
};

export default EmrRecordList;

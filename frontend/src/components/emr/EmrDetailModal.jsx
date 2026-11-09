// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
import React, { useRef } from 'react';
import {
  X,
  Stethoscope,
  HeartPulse,
  Thermometer,
  Weight,
  Calendar,
  FlaskConical,
  Pill,
  Printer,
  CheckCircle2,
  Clock,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

const EmrDetailModal = ({ record, isOpen, onClose }) => {
  const printRef = useRef(null);

  if (!isOpen || !record) return null;

  const {
    id,
    pet,
    vet,
    weight,
    temperature,
    heartRate,
    symptoms,
    diagnosis,
    treatmentPlan,
    status,
    createdAt,
    prescriptions = [],
    labOrders = [],
  } = record;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'COMPLETED':
      case 'EXAMINATION_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã hoàn thành (COMPLETED)
          </span>
        );
      case 'WAITING_LAB_RESULT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Chờ kết quả xét nghiệm (WAITING LAB)
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5" />
            Đang khám (IN PROGRESS)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {st}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div
        ref={printRef}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Hồ sơ bệnh án điện tử (EMR)
                </h2>
                {getStatusBadge(status)}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Mã bệnh án: {id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-sm"
              title="In bệnh án"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>In bệnh án</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Pet & Owner Overview Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Thông tin thú cưng
              </span>
              <div className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>{pet?.name}</span>
                <span className="text-xs font-normal text-slate-500">
                  ({pet?.species} • {pet?.breed || 'Chưa rõ giống'})
                </span>
              </div>
              <div className="text-xs text-slate-600 space-x-3">
                <span>Giới tính: <strong>{pet?.gender || 'N/A'}</strong></span>
                <span>•</span>
                <span>Cân nặng ghi nhận: <strong>{weight || pet?.weight || 'N/A'} kg</strong></span>
              </div>
            </div>

            <div className="space-y-1.5 border-t md:border-t-0 md:border-l md:pl-4 border-blue-200/60 pt-2 md:pt-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                Chủ nuôi & Bác sĩ phụ trách
              </span>
              <div className="text-xs text-slate-700">
                Chủ nuôi: <strong>{pet?.owner?.user?.fullName || 'Khách vãng lai'}</strong> - SĐT: {pet?.owner?.user?.phone || 'N/A'}
              </div>
              <div className="text-xs text-slate-700">
                Bác sĩ điều trị: <strong>{vet?.fullName || 'Dr. PHMS Staff'}</strong>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Thời gian khám: {new Date(createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>

          {/* Vital Signs (Sinh hiệu lâm sàng) */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Chỉ số sinh hiệu lâm sàng</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Weight className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Cân nặng</span>
                  <div className="text-base font-bold text-slate-800">
                    {weight ? `${weight} kg` : 'Chưa nhập'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Thân nhiệt</span>
                  <div className="text-base font-bold text-slate-800">
                    {temperature ? `${temperature} °C` : 'Chưa đo'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Nhịp tim</span>
                  <div className="text-base font-bold text-slate-800">
                    {heartRate ? `${heartRate} bpm` : 'Chưa đo'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Findings & Diagnosis */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Triệu chứng & Khám thực thể (Findings)
              </span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {symptoms || 'Không ghi nhận triệu chứng bất thường cụ thể.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Chẩn đoán lâm sàng (Diagnosis - ICD-Vet)
              </span>
              <p className="text-base font-bold text-emerald-950">
                {diagnosis}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Kế hoạch điều trị & Chăm sóc (Treatment Plan)
              </span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {treatmentPlan}
              </p>
            </div>
          </div>

          {/* Paraclinical Lab Results (LAB-01 / LAB-02) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                <FlaskConical className="w-4 h-4 text-indigo-600" />
                <span>Xét nghiệm cận lâm sàng ({labOrders.length})</span>
              </h3>
            </div>

            {labOrders.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Không có chỉ định xét nghiệm cận lâm sàng trong đợt khám này.
              </div>
            ) : (
              <div className="space-y-4">
                {labOrders.map((lab) => (
                  <div
                    key={lab.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{lab.testType}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              lab.urgency === 'URGENT'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {lab.urgency}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Mã order: {lab.orderCode} • Chỉ định bởi: {lab.vet?.fullName || 'Bác sĩ điều trị'}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            lab.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lab.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {lab.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {lab.status}
                        </span>
                      </div>
                    </div>

                    {lab.requestNote && (
                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-700">Ghi chú bác sĩ:</span> {lab.requestNote}
                      </div>
                    )}

                    {/* Measured values table */}
                    {lab.resultValues && typeof lab.resultValues === 'object' && (
                      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 p-2">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-100 text-[10px] uppercase font-bold">
                              <th className="pb-2">Chỉ số xét nghiệm</th>
                              <th className="pb-2">Kết quả đo</th>
                              <th className="pb-2">Đơn vị</th>
                              <th className="pb-2">Khoảng tham chiếu chuẩn</th>
                              <th className="pb-2">Đánh giá</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {Object.entries(lab.resultValues).map(([key, val]) => {
                              const isObj = typeof val === 'object' && val !== null;
                              const valueStr = isObj ? val.value : val;
                              const unitStr = isObj ? val.unit : '-';
                              const refStr = isObj ? val.refRange : '-';
                              const flagStr = isObj ? val.flag : 'NORMAL';
                              const isAbnormal = flagStr === 'HIGH' || flagStr === 'LOW';

                              return (
                                <tr key={key} className="hover:bg-slate-50">
                                  <td className="py-1.5 font-medium text-slate-800">{key}</td>
                                  <td className={`py-1.5 font-bold ${isAbnormal ? 'text-rose-600' : 'text-slate-700'}`}>
                                    {valueStr}
                                  </td>
                                  <td className="py-1.5 text-slate-500">{unitStr}</td>
                                  <td className="py-1.5 text-slate-500">{refStr}</td>
                                  <td className="py-1.5">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        isAbnormal ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                      }`}
                                    >
                                      {flagStr}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {lab.resultSummary && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[11px] font-bold uppercase text-slate-500">
                          Kết luận xét nghiệm & Quan sát của Kỹ thuật viên
                        </span>
                        <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap">
                          {lab.resultSummary}
                        </p>
                        {lab.nurse?.fullName && (
                          <span className="text-[10px] text-slate-400 block pt-1">
                            Thực hiện bởi Kỹ thuật viên: {lab.nurse.fullName}
                          </span>
                        )}
                      </div>
                    )}

                    {lab.resultImageUrl && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                          Hình ảnh kết quả cận lâm sàng (X-Ray / Siêu âm)
                        </span>
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-black/5 max-h-60 flex items-center justify-center">
                          <img
                            src={lab.resultImageUrl}
                            alt="Lab Result Diagnostic Evidence"
                            className="max-h-60 object-contain hover:scale-105 transition-transform"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions (Đơn thuốc điện tử - UC-PRES-01) */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Đơn thuốc chỉ định ({prescriptions.length})</span>
            </h3>

            {prescriptions.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Không kê đơn thuốc kèm theo trong lượt khám này.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-4">Tên thuốc</th>
                      <th className="py-2.5 px-3">Liều lượng</th>
                      <th className="py-2.5 px-3">Số lượng</th>
                      <th className="py-2.5 px-3">Thời gian</th>
                      <th className="py-2.5 px-4">Hướng dẫn sử dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescriptions.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {p.medicineName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{p.dosage}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {p.quantity} {p.unit || 'viên'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{p.duration || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-600">{p.instructions || 'Uống theo chỉ định'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-400">
            Hệ thống Bệnh viện Thú y PHMS • Hồ sơ bệnh án điện tử an toàn
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-sm"
          >
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmrDetailModal;

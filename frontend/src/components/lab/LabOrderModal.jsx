// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
import React, { useState, useEffect } from 'react';
import {
  X,
  FlaskConical,
  Send,
} from 'lucide-react';
import labService from '../../services/labService';
import emrService from '../../services/emrService';
import Alert from '../ui/Alert';

const LabOrderModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialRecordId = null,
  initialPetId = null,
}) => {
  const [labCatalog, setLabCatalog] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(initialRecordId || '');
  const [testType, setTestType] = useState('');
  const [customTestName, setCustomTestName] = useState('');
  const [urgency, setUrgency] = useState('ROUTINE');
  const [requestNote, setRequestNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSelectedRecordId(initialRecordId || '');
      setUrgency('ROUTINE');
      setRequestNote('');
      setCustomTestName('');

      labService.getLabCatalog().then((res) => {
        const cat = res.data || [];
        setLabCatalog(cat);
        if (cat.length > 0) {
          setTestType(cat[0].type);
        }
      });

      // Fetch active medical records if not pre-provided
      if (!initialRecordId) {
        emrService.getMedicalRecords().then((res) => {
          setRecords(res.data || []);
          if (res.data?.length > 0) {
            setSelectedRecordId(res.data[0].id);
          }
        });
      }
    }
  }, [isOpen, initialRecordId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecordId) {
      setErrorMessage('Vui lòng chọn hồ sơ bệnh án liên kết với xét nghiệm này.');
      return;
    }

    const finalTestType =
      testType === 'CUSTOM' ? customTestName.trim() : testType;

    if (!finalTestType) {
      setErrorMessage('Vui lòng chọn hoặc nhập tên loại xét nghiệm.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        recordId: selectedRecordId,
        petId: initialPetId || undefined,
        testType: finalTestType,
        urgency,
        requestNote: requestNote.trim() || null,
      };

      const result = await labService.issueLabOrder(payload);
      if (onSuccess) onSuccess(result.data);
      onClose();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Không thể tạo chỉ định xét nghiệm.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Chỉ định xét nghiệm cận lâm sàng (LAB-01)
              </h2>
              <p className="text-xs text-slate-500">
                Gửi yêu cầu xét nghiệm đến hàng đợi làm việc của Kỹ thuật viên / Điều dưỡng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage('')}
            />
          )}

          {/* Select Medical Record if not predetermined */}
          {!initialRecordId && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Hồ sơ bệnh án liên kết (Medical Record) *
              </label>
              <select
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.pet?.name} ({r.pet?.species}) - Chẩn đoán: {r.diagnosis} (Ngày: {new Date(r.createdAt).toLocaleDateString('vi-VN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Select Test Type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Loại xét nghiệm / Kỹ thuật cận lâm sàng *
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {labCatalog.map((lc) => (
                <option key={lc.type} value={lc.type}>
                  {lc.type} [{lc.category} - SLA: {lc.slaRoutine}]
                </option>
              ))}
              <option value="CUSTOM">+ Xét nghiệm tùy chỉnh khác (Custom Test)</option>
            </select>
          </div>

          {/* If Custom Test selected (Alternative Flow 1.2) */}
          {testType === 'CUSTOM' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Tên xét nghiệm tùy chỉnh *
              </label>
              <input
                type="text"
                placeholder="Nhập tên kỹ thuật xét nghiệm cần thực hiện..."
                value={customTestName}
                onChange={(e) => setCustomTestName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}

          {/* Urgency Level (Alternative Flow 1.1) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Mức độ ưu tiên thực hiện (Urgency Level)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  urgency === 'ROUTINE'
                    ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-950'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value="ROUTINE"
                  checked={urgency === 'ROUTINE'}
                  onChange={() => setUrgency('ROUTINE')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs block">Tiêu chuẩn (ROUTINE)</span>
                  <span className="text-[10px] text-slate-400 font-normal">SLA tiêu chuẩn 24 giờ</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  urgency === 'URGENT'
                    ? 'border-rose-600 bg-rose-50/60 font-bold text-rose-950'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value="URGENT"
                  checked={urgency === 'URGENT'}
                  onChange={() => setUrgency('URGENT')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs block text-rose-700">Khẩn cấp (URGENT)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ưu tiên số 1 • SLA 2 giờ</span>
                </div>
              </label>
            </div>
          </div>

          {/* Clinical Instructions / Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Chỉ định lâm sàng & Ghi chú cho Kỹ thuật viên
            </label>
            <textarea
              rows={3}
              placeholder="VD: Kiểm tra bạch cầu để đánh giá mức độ nhiễm trùng, nghi ngờ dị vật đường tiêu hóa..."
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Đang gửi...' : 'Phát hành chỉ định xét nghiệm (LAB-01)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabOrderModal;

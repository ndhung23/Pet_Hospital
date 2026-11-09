import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Sparkles,
  Bot,
  User,
  CalendarPlus,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import emrService from '../../services/emrService';
import EmrRecordList from '../../components/emr/EmrRecordList';

const PetOwnerDashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const fetchRecords = async () => {
    setRecordsLoading(true);
    try {
      const res = await emrService.getMedicalRecords();
      setRecords(res.data || []);
    } catch (err) {
      console.error('Failed to load owner records:', err);
    } finally {
      setRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pet Owner Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">Welcome back, {user?.fullName}!</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Access 24/7 AI-guided health triage, track your pets' clinical history, and manage your account.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/ai-advisor"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Consult AI Health Advisor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">AI Health Guidance</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Query symptoms anytime. Built-in emergency detection alerts you if symptoms require emergency triage.
          </p>
          <Link
            to="/ai-advisor"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Hồ sơ bệnh án (EMR)</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Xem chi tiết chẩn đoán, sinh hiệu, kết quả xét nghiệm máu, siêu âm và đơn thuốc của thú cưng.
          </p>
          <Link
            to="/records"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>Xem bệnh án ({records.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">My Profile & Pets</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Update your residential address, contact number, and review your registered pets and clinical history.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Online Appointments</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Book appointments with on-duty veterinarians (UC-BOOK-01 module scheduled in next sprint).
          </p>
          <span className="inline-block mt-4 text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
            Coming Soon (UC-BOOK-01)
          </span>
        </div>
      </div>

      {/* Embedded EMR-02 & EMR-03 List Section */}
      <div className="pt-2">
        <EmrRecordList
          records={records}
          loading={recordsLoading}
          onRefresh={fetchRecords}
          title="Hồ sơ sức khỏe & Lịch sử khám của thú cưng (EMR-02 / EMR-03)"
          description="Danh sách hồ sơ bệnh án điện tử, kết quả xét nghiệm cận lâm sàng và đơn thuốc được bác sĩ cấp."
        />
      </div>
    </div>
  );
};

export default PetOwnerDashboard;

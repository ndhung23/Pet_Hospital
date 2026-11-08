import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboardRoute } from '../contexts/AuthContext';
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Activity,
  PhoneCall,
  ArrowRight,
  FileText,
  Syringe,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const Home = () => {
  const { user, role } = useAuth();
  const dashboardRoute = getRoleDashboardRoute(role);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Subtle background glow circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
          <div className="absolute top-12 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-800 border border-blue-200/60 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>PHMS Veterinary Hospital & Clinical Suite</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-snug">
                Dedicated Care for Pets,{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                  Powered by Modern Clinical Science
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                24/7 emergency walk-in triage, certified veterinary specialists, Gemini 2.0 AI health advisory, and tamper-evident electronic medical records — all in one unified platform.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                {user ? (
                  <>
                    <Link
                      to={dashboardRoute}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <span>Go to My Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {role === 'PET_OWNER' && (
                      <Link
                        to="/ai-advisor"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-indigo-700 font-semibold text-sm border border-indigo-200 hover:bg-indigo-50/60 shadow-sm transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Consult AI Health Guide</span>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <span>Register Pet Owner Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-700 font-semibold text-sm border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
                    >
                      <span>Sign In to Portal</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Key Trust Metrics */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-bold text-slate-900">24/7</p>
                  <p className="text-xs text-slate-500 font-medium">Emergency Triage</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">Level 1-3</p>
                  <p className="text-xs text-slate-500 font-medium">Priority Queue</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Electronic EMR</p>
                </div>
              </div>
            </div>

            {/* Right Image Column with home.jpg */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative border frame */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 ring-1 ring-slate-200">
                  <img
                    src={`${process.env.PUBLIC_URL}/home.jpg`}
                    alt="Veterinary doctor examining a cat with gentle care at PHMS Hospital"
                    className="w-full h-auto object-cover object-center max-h-[460px] hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  {/* Subtle bottom gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                  {/* Image caption badge inside photo */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-sm font-semibold flex items-center gap-1.5 drop-shadow-sm">
                      <Stethoscope className="w-4 h-4 text-blue-400" />
                      Veterinary Clinical Suite & Triage
                    </p>
                    <p className="text-xs text-slate-200 drop-shadow-sm">
                      Specialized veterinary care for felines, canines & small companions.
                    </p>
                  </div>
                </div>

                {/* Floating Glassmorphism Badge 1: Top-Left */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <p className="text-xs font-bold text-slate-800">Triage Active</p>
                    </div>
                    <p className="text-[11px] text-slate-500">Walk-in priority ready</p>
                  </div>
                </div>

                {/* Floating Glassmorphism Badge 2: Bottom-Right */}
                <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">AI Symptom Advisor</p>
                    <p className="text-[11px] text-slate-500">24/7 Clinical triage AI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EMERGENCY WALK-IN BANNER (EMG-01 / BR-04) */}
      <section className="bg-slate-900 text-white py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-rose-950/80 via-slate-800 to-slate-900 border border-rose-900/40 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>TIẾP NHẬN CẤP CỨU KHẨN CẤP 24/7</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Has your pet suffered sudden trauma or acute illness?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Walk straight to our reception desk. Our triage protocol immediately assesses severity and routes critical patients to the priority queue overriding scheduled appointments.
                </p>

                {/* Severity Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-3">
                    <span className="text-xs font-bold text-rose-400 block">Level 1 - Critical</span>
                    <span className="text-[11px] text-slate-300">Respiratory arrest, shock, active hemorrhage. Priority #1.</span>
                  </div>
                  <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3">
                    <span className="text-xs font-bold text-amber-400 block">Level 2 - Urgent</span>
                    <span className="text-[11px] text-slate-300">Severe trauma, acute toxicity, continuous seizure. Priority #2.</span>
                  </div>
                  <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3">
                    <span className="text-xs font-bold text-blue-400 block">Level 3 - Standard</span>
                    <span className="text-[11px] text-slate-300">Stable walk-in case, evaluated within standard triage order.</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center gap-3">
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 w-full text-left">
                  <div className="flex items-center gap-2 text-rose-400 mb-1">
                    <PhoneCall className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Emergency Hotline</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-white">0359 928 446</p>
                  <p className="text-[11px] text-slate-400 mt-1">Available 24 hours a day, 7 days a week</p>
                </div>
                <Link
                  to="/reception"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-900/30 transition-colors"
                >
                  <span>Reception Triage Desk</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE HOSPITAL CAPABILITIES */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Hospital Services & Workflow</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Integrated Veterinary Excellence
            </p>
            <p className="text-slate-600 text-base mt-3">
              Built specifically to streamline the entire veterinary lifecycle from emergency intake to diagnosis, treatment, and discharge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Phân Loại Cấp Cứu Khẩn Cấp</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tiếp nhận tại quầy lễ tân với đánh giá phân tầng 3 cấp độ nghiêm trọng. Tự động chuyển bệnh nhân nguy cấp vào hàng đợi ưu tiên của bác sĩ trực.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center text-xs font-semibold text-rose-600">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Hàng đợi ưu tiên tự động</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bác Sĩ Trợ Lý AI</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tích hợp mô hình AI thông minh. Kết hợp lịch sử lâm sàng của thú cưng để tư vấn sơ cứu nhanh và cảnh báo nguy cơ khẩn cấp 24/7.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center text-xs font-semibold text-indigo-600">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Phản hồi tức thì & Chính xác</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Hồ Sơ Bệnh Án Điện Tử (EMR)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Quản lý lịch sử khám tập trung, chỉ số sinh hiệu (cân nặng, thân nhiệt, nhịp tim), chẩn đoán y khoa và phác đồ điều trị an toàn, bảo mật.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center text-xs font-semibold text-blue-600">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Lưu trữ số hóa an toàn & minh bạch</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Khám Chuyên Khoa Thú Y</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Đội ngũ bác sĩ thú y giàu kinh nghiệm điều trị nội khoa, phẫu thuật ngoại khoa, da liễu và chẩn đoán hình ảnh chuyên sâu.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Bác sĩ thú y chứng chỉ hành nghề</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
                <Syringe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Xét Nghiệm & Chẩn Đoán Hình Ảnh</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hệ thống X-quang kỹ thuật số, siêu âm Doppler, máy huyết học và sinh hóa tự động cho kết quả nhanh ngay trong ngày.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center text-xs font-semibold text-cyan-600">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Xét nghiệm tại chỗ đồng bộ</span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bảo Mật Quyền Truy Cập (RBAC)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Phân quyền chặt chẽ giữa Chủ nuôi, Lễ tân, Bác sĩ, Y tá và Quản lý phòng khám nhằm bảo vệ dữ liệu hồ sơ bệnh nhân tối đa.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center text-xs font-semibold text-purple-600">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Bảo mật y tế đa lớp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI DEMO PREVIEW SECTION */}
      <section className="py-16 bg-gradient-to-br from-indigo-50/60 via-blue-50/40 to-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SMART CLINICAL ASSISTANT</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Get Instant Guidance When Every Second Counts
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Wondering if your pet's sudden vomiting or lethargy requires urgent emergency attention? Our AI Health Advisor provides immediate preliminary evaluation and alerts you to bring your pet to the hospital if critical signs are detected.
              </p>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Enriched with your pet's previous vaccination and medical history</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Automated emergency triage detection with hospital directions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Explicit clinical disclaimers preserving veterinary doctor oversight</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  to={user ? '/ai-advisor' : '/login'}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try AI Health Advisor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* AI Mock Chat Window */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">PHMS AI Clinical Advisor</p>
                      <p className="text-[10px] text-emerald-600 font-medium">● Online • Gemini 2.0 Flash</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    Preliminary Triage
                  </span>
                </div>

                {/* Chat message user */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white text-xs sm:text-sm p-3.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                    "My 2-year-old cat has been vomiting bile and hiding under the bed for 6 hours. Should I bring her in?"
                  </div>
                </div>

                {/* Chat message AI */}
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-800 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-sm max-w-[90%] space-y-2 border border-slate-200/60">
                    <p className="font-semibold text-slate-900">
                      🚨 Potential Urgency Detected:
                    </p>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      Lethargy and hiding combined with continuous vomiting can indicate dehydration, gastrointestinal obstruction, or acute toxicity.
                    </p>
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 font-medium">
                      ⚠️ <strong>Recommendation:</strong> Bring your cat immediately to the PHMS Emergency Desk. This qualifies for Priority Triage Level 2.
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Disclaimer: AI advice does not replace formal clinical diagnosis by a licensed veterinarian.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FOR PET OWNERS */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Give Your Beloved Companion the Best Care Today
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
              Register now to maintain your pet's complete digital health records, receive preventive vaccination reminders, and access 24/7 clinical services.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 shadow-md transition-colors"
              >
                Create Free Pet Owner Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-sm border border-blue-400/40 transition-colors"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-bold text-white">PHMS Hospital</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Veterinary Care & Clinical Suite. Providing advanced medical solutions and emergency triage for all pets.
              </p>
              <p className="text-slate-500 text-[11px]">
                Chuẩn mực lâm sàng chất lượng cao & lưu trữ hồ sơ bệnh án bảo mật.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <p className="text-white font-semibold text-sm mb-3">Hospital Services</p>
              <ul className="space-y-2">
                <li><Link to="/reception" className="hover:text-white transition-colors">Emergency Walk-In Triage</Link></li>
                <li><Link to="/ai-advisor" className="hover:text-white transition-colors">AI Clinical Advisor</Link></li>
                <li><Link to="/vet" className="hover:text-white transition-colors">Specialist Consultations</Link></li>
                <li><Link to="/lab" className="hover:text-white transition-colors">Diagnostic Imaging & Lab</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <p className="text-white font-semibold text-sm mb-3">Operating Hours</p>
              <ul className="space-y-2 text-slate-400">
                <li className="flex justify-between">
                  <span>Emergency Triage:</span>
                  <span className="text-emerald-400 font-bold">24/7 / 365 Days</span>
                </li>
                <li className="flex justify-between">
                  <span>Routine Consultations:</span>
                  <span className="text-white">08:00 - 20:00</span>
                </li>
                <li className="flex justify-between">
                  <span>In-House Laboratory:</span>
                  <span className="text-white">07:30 - 21:00</span>
                </li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <p className="text-white font-semibold text-sm mb-3">Contact & Support</p>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                  <span>Hotline: 0359 928 446</span>
                </li>
                <li>Email: contact@phms-hospital.vn</li>
                <li>Location: Veterinary Medical Center, Hanoi, Vietnam</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} PHMS Veterinary Hospital. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-slate-400 cursor-pointer">Veterinary Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

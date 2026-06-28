import React from "react";
import { X, Download, ZoomIn, ExternalLink } from "lucide-react";

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  title = "📸 รูปถ่ายหลักฐานรายงานเหตุภัยพิบัติ",
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `flood-evidence-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Fallback if data url download fails
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Container */}
      <div 
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-xl">🔍</span>
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="ดาวน์โหลดรูปภาพ"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold px-3 border border-slate-700/60"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">บันทึกรูปภาพ</span>
            </button>
            <button
              onClick={onClose}
              title="ปิดหน้าต่าง"
              className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all border border-red-500/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-auto min-h-[300px] max-h-[75vh] bg-black/40">
          <img
            src={imageUrl}
            alt="หลักฐานภัยพิบัติ"
            className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/10 transition-transform duration-300 select-none"
          />
        </div>

        {/* Bottom Bar Info */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span>💡 คำแนะนำ: คุณสามารถซูมดูรายละเอียดจุดสังเกตระดับน้ำหรือป้ายบอกทางในรูปได้</span>
          <span className="text-[11px] opacity-70">NakhonFlood AI System Audit Verification</span>
        </div>
      </div>
    </div>
  );
};

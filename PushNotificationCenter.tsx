import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, AlertTriangle, X, RefreshCw, Eye, Volume2, VolumeX, Sparkles, Check } from "lucide-react";

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  productId?: string;
  productName?: string;
  timestamp: string;
}

interface PushNotificationCenterProps {
  notifications: PushNotification[];
  onDismiss: (id: string) => void;
  onRestock: (productId: string) => void;
  onView: (productId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  permissionStatus: NotificationPermission;
  onRequestPermission: () => void;
}

export default function PushNotificationCenter({
  notifications,
  onDismiss,
  onRestock,
  onView,
  soundEnabled,
  onToggleSound,
  permissionStatus,
  onRequestPermission,
}: PushNotificationCenterProps) {
  return (
    <div 
      className="fixed top-20 right-4 z-50 w-full max-w-sm flex flex-col gap-3 pointer-events-none px-4 sm:px-0"
      id="push-notification-center"
    >
      {/* Sound Status & Permission Quick Bar (Only shown if notifications exist or as a subtle helper) */}
      {notifications.length > 0 && (
        <div className="bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-zinc-300 rounded-full px-3.5 py-1.5 flex items-center justify-between text-[10px] font-mono shadow-lg self-end pointer-events-auto gap-4 transition-all">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Simulating Web Push notifications</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              title={soundEnabled ? "Disable synthesized notification chime" : "Enable synthesized notification chime"}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
            {permissionStatus !== "granted" && (
              <button
                onClick={onRequestPermission}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-2 py-0.5 rounded-full text-[9px] transition-all"
                title="Grant browser system notifications permission"
              >
                Allow System Push
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main notification stack */}
      <div className="flex flex-col gap-3 w-full">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-md border border-zinc-200/90 shadow-2xl rounded-2xl overflow-hidden pointer-events-auto flex flex-col text-xs transition-shadow hover:shadow-zinc-300/50 w-full"
              style={{ contentVisibility: "auto" }}
              id={`push-toast-${notif.id}`}
            >
              {/* Native MacOS/Windows Simulator Header */}
              <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between gap-2 select-none">
                <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px]">
                  <div className="w-4 h-4 rounded-md bg-zinc-900 text-white flex items-center justify-center font-display font-black text-[9px] tracking-tighter">
                    TD
                  </div>
                  <span className="font-bold text-zinc-700">THREAD DEN</span>
                  <span>•</span>
                  <span>{notif.timestamp}</span>
                </div>
                <button
                  onClick={() => onDismiss(notif.id)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Notification Body */}
              <div className="p-4 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-500">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
                <div className="space-y-1 flex-grow">
                  <h4 className="font-bold text-zinc-900 flex items-center gap-1">
                    {notif.title}
                  </h4>
                  <p className="text-zinc-600 leading-relaxed text-[11px]">
                    {notif.body}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-4 py-3 bg-zinc-50/50 border-t border-zinc-100 flex gap-2">
                <button
                  onClick={() => {
                    if (notif.productId) onView(notif.productId);
                    onDismiss(notif.id);
                  }}
                  className="flex-1 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold py-1.5 px-3 rounded-lg border border-zinc-200 transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Stock Row</span>
                </button>
                {notif.productId && (
                  <button
                    onClick={() => {
                      onRestock(notif.productId!);
                      onDismiss(notif.id);
                    }}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-xs hover:shadow-zinc-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>Quick Restock (+50)</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

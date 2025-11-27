"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, User } from 'lucide-react';

interface NotificationItem {
  id: number;
  type: 'incoming' | 'accepted';
  other_user_name: string;
  other_user_study: string;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/contact-requests');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  // Poll for notifications every 30 seconds
  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (requestId: number, action: 'accept' | 'reject' | 'mark_seen') => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action }),
      });

      if (res.ok) {
        // Remove from list
        setNotifications(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (error) {
      console.error("Failed to update request", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell size={22} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-slate-800 text-sm">Varsler</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                Ingen nye varsler
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-4 transition-colors ${notif.type === 'accepted' ? 'bg-green-50/30 hover:bg-green-50/50' : 'hover:bg-blue-50/50'}`}>
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {notif.type === 'accepted' ? <Check size={20} /> : <User size={20} />}
                      </div>
                      <div className="flex-1">
                        {notif.type === 'incoming' ? (
                          <>
                            <p className="text-sm text-slate-800">
                              <strong>{notif.other_user_name}</strong> vil dele kontaktinfo med deg.
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {notif.other_user_study}
                            </p>
                            
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleAction(notif.id, 'accept')}
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <Check size={14} /> Godta
                              </button>
                              <button
                                onClick={() => handleAction(notif.id, 'reject')}
                                disabled={loading}
                                className="flex-1 bg-gray-100 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                              >
                                <X size={14} /> Avslå
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-slate-800">
                              <strong>{notif.other_user_name}</strong> godtok forespørselen din!
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Du kan nå se navnet i kartet.
                            </p>
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => handleAction(notif.id, 'mark_seen')}
                                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                              >
                                Marker som lest
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Backdrop to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

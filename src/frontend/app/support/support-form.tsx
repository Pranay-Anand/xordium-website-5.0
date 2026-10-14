"use client";

import { useState } from "react";
import { CheckCircle, Send, Radio, Copy, Check, ChevronDown, HelpCircle, MessageSquare, Mail, MapPin, Clock, ExternalLink, AlertCircle } from "lucide-react";

export function SupportForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    game: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedDispatch, setSubmittedDispatch] = useState<{
    dispatchId: string;
    notificationSent: boolean;
  } | null>(null);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: {
        success?: boolean;
        error?: string;
        dispatchId?: string;
        notificationSent?: boolean;
      } = await response.json();

      if (response.ok && result.success) {
        setSubmittedDispatch({
          dispatchId: result.dispatchId ?? '',
          notificationSent: result.notificationSent === true,
        });
      } else {
        throw new Error(result.error || 'Failed to dispatch message');
      }
    } catch (err: unknown) {
      console.error('Support message submission failed:', err instanceof Error ? err.name : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(label);
    setTimeout(() => setCopiedChannel(null), 2000);
  };

  return (
    <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-16">
      {/* 1. PAGE HEADER */}
      <section className="border-b border-white/10 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[13px] tracking-[0.3em] text-red-500 uppercase">
            SUPPORT // TERMINAL 04
          </span>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        </div>
        <h1 className="font-display text-4xl leading-none font-black uppercase sm:text-5xl">
          SUPPORT // <span className="text-red-600">XORDIUM 5.0</span>
        </h1>
        <p className="font-mono text-[13px] text-white/60 max-w-3xl mt-2 leading-relaxed">
          Transmission issues, registration queries, or hardware compatibility checks — open a ticket and the committee
          arbiters respond via comms.
        </p>
      </section>

      {/* 2. TWO-COLUMN DIRECTORY & CONTACT FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-white/10 bg-[#101218] p-6 sm:p-8 md:p-10">
        {/* LEFT COLUMN: Touchpoints */}
        <aside
          className="lg:col-span-5 flex flex-col justify-between space-y-8 border-b lg:border-b-0 lg:border-r border-white/10 lg:pr-8 pb-8 lg:pb-0">
          <div>
            <div className="border-b border-white/10 pb-2 mb-6">
              <h2 className="font-mono text-[13px] font-bold uppercase text-white">DIRECTORY & DISPATCH</h2>
              <p className="font-mono text-[13px] text-white/40 text-[13px]">
                PRIMARY TOUCHPOINTS FOR PARTICIPANTS & TEAMS
              </p>
            </div>

            {/* Contact Channels List */}
            <div className="space-y-4">
              {/* Official Email Channel */}
              <div className="bg-[#0d0f14] border border-white/10 p-4 group hover:border-red-500 transition-colors">
                <div className="flex justify-between items-center">
                  <span
                    className="font-mono text-[13px] text-red-500 uppercase text-[13px] flex items-center gap-1.5 font-bold">
                    <Mail className="w-3.5 h-3.5"/>
                    <span>OFFICIAL EMAIL</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard('support@xordium.igniteclub.tech', 'Official Email')}
                    className="text-white/40 hover:text-red-500 text-[13px] font-mono flex items-center gap-1"
                  >
                    {copiedChannel === 'Official Email' ? <Check className="w-3 h-3 text-red-500"/> :
                      <Copy className="w-3 h-3"/>}
                    <span>{copiedChannel === 'Official Email' ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
                <a
                  className="font-mono text-[13px] text-white hover:text-red-500 transition-colors block mt-1"
                  href="mailto:ignite@bitmesra.ac.in"
                >
                  ignite@bitmesra.ac.in
                </a>
                <span className="font-mono text-[13px] text-white/40 mt-1 block">
                  Saved to the admin inbox • Email notification when configured
                </span>
              </div>

              {/* Discord Community */}
              <div
                className="bg-[#0d0f14] border border-white/10 p-4 relative overflow-hidden group hover:border-red-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[13px] text-red-500 uppercase text-[13px] flex items-center gap-1.5 font-bold">
                    <MessageSquare className="w-3.5 h-3.5"/>
                    <span>Whatsapp Community</span>
                  </span>
                </div>
                <a
                  className="font-mono text-[13px] text-white hover:text-red-500 transition-colors block mt-1"
                  href="https://chat.whatsapp.com/KcL7hlFXZCw78nP3hWkza0"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xordium 5.0
                </a>
                <span className="font-mono text-[13px] text-white/40 mt-1 block text-[13px]">
                  Event updates and frequently asked question direclty from coordinators
                </span>
              </div>

              {/* Instagram */}
              <div className="bg-[#0d0f14] border border-white/10 p-4 group hover:border-red-500 transition-colors">
                <div className="flex justify-between items-center">
                  <span
                    className="font-mono text-[13px] text-red-500 uppercase text-[13px] flex items-center gap-1.5 font-bold">
                    <ExternalLink className="w-3.5 h-3.5"/>
                    <span>INSTAGRAM</span>
                  </span>
                  <a
                    href="https://instagram.com/ignite_bitp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-red-500 text-[13px] font-mono"
                  >
                    </a>
                </div>
                <a
                  className="font-mono text-[13px] text-white hover:text-red-500 transition-colors block mt-1"
                  href="https://instagram.com/ignite_bitp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @ignite_bitp
                </a>
                <span className="font-mono text-[13px] text-white/40 mt-1 block text-[13px]">
                  Highlights, tournament stories, and match announcements
                </span>
              </div>

            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Contact Form with Mail Delivery Pipeline */}
        <section className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="border-b border-white/10 pb-2 mb-6">
              <h2 className="font-mono text-[13px] font-bold uppercase text-white">DISPATCH MESSAGE</h2>
              <p className="font-mono text-[13px] text-white/40 text-[13px]">
                MESSAGES ARE STORED IN THE ADMIN INBOX
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Name */}
              <div>
                <label className="block font-mono text-[13px] uppercase text-white/60 mb-1">
                  Your Name (Student Name / Gamer Tag) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name"
                  className="w-full bg-[#0d0f14] border border-white/10 px-4 py-3 text-white font-mono text-[13px] focus:border-red-500 outline-none transition-colors"
                />
              </div>

              {/* Field 2: Email */}
              <div>
                <label className="block font-mono text-[13px] uppercase text-white/60 mb-1">
                  Email Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. name@example.com"
                  className="w-full bg-[#0d0f14] border border-white/10 px-4 py-3 text-white font-mono text-[13px] focus:border-red-500 outline-none transition-colors"
                />
              </div>

              {/* Field 3: Inquiry Topic */}
              <div>
                <label className="block font-mono text-[13px] uppercase text-white/60 mb-1">
                  Inquiry Topic <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="w-full bg-[#0d0f14] border border-white/10 px-4 py-3 text-white font-mono text-[13px] focus:border-red-500 outline-none transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select an inquiry topic...</option>
                  <option value="registration">Registration / Team Registration Query</option>
                  <option value="technical">Technical Issue / Bug Report</option>
                  <option value="general">General Question</option>
                </select>
              </div>

              {/* Field 4: Message */}
              <div>
                <label className="block font-mono text-[13px] uppercase text-white/60 mb-1">
                  Message Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Provide your query, bracket dispute details, or technical issue description..."
                  className="w-full bg-[#0d0f14] border border-white/10 p-4 text-white font-mono text-[13px] focus:border-red-500 outline-none transition-colors resize-y"
                ></textarea>
              </div>

              {/* Submit Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-red-600 text-white font-mono text-[13px] font-bold px-8 py-3.5 uppercase tracking-wider hover:bg-red-500 transition-colors duration-150 text-[13px] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4"/>
                  <span>{isSubmitting ? 'SENDING MESSAGE...' : 'SEND MESSAGE'}</span>
                </button>
              </div>

              {/* Delivery Confirmation Banner */}
              {submittedDispatch && (
                <div className="bg-[#1d1f26] border border-red-500 p-4 mt-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-red-500"/>
                    <span className="font-mono text-[13px] text-red-500 uppercase">
                      {submittedDispatch.notificationSent ? 'DISPATCH SENT TO COMMITTEE ARBITERS' : 'MESSAGE RECEIVED'}
                    </span>
                  </div>
                  <p className="font-mono text-[13px] text-white/60 mt-1">
                    Your message reference
                    is {submittedDispatch.dispatchId}. {submittedDispatch.notificationSent ? 'Committee arbiters have been notified.' : 'Committee administrators can review it in the admin inbox.'}
                  </p>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

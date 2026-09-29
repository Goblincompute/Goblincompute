import React, { useState } from 'react';
import { TerminalButton } from './TerminalButton';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'BUG' | 'IDEA' | 'CONFUSING' | 'OTHER';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<FeedbackType>('BUG');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `[GOBLIN COMPUTE FEEDBACK]\nType: ${type}\nMessage: ${message}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!message.trim()) return;
    const existing = JSON.parse(localStorage.getItem('goblin_compute_feedback') || '[]');
    const newFeedback = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('goblin_compute_feedback', JSON.stringify([newFeedback, ...existing]));
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono">
      <div className="w-full max-w-md border border-[#60FF70] bg-[#050805] p-5 shadow-[0_0_25px_rgba(96,255,112,0.25)] relative space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#60FF70]/40">
          <div className="text-xs font-bold tracking-widest text-[#60FF70] uppercase flex items-center gap-2">
            <span>&gt;</span>
            <span>SEND TESTER FEEDBACK</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#60FF70] hover:text-white text-sm font-bold cursor-pointer px-1"
          >
            [X]
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[#688D6C] block uppercase text-[11px]">&gt; SELECT FEEDBACK TYPE:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['BUG', 'IDEA', 'CONFUSING', 'OTHER'] as FeedbackType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-1.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                    type === t
                      ? 'border-[#60FF70] bg-[#60FF70]/20 text-[#60FF70]'
                      : 'border-[#60FF70]/30 text-[#688D6C] hover:border-[#60FF70]/60'
                  }`}
                >
                  [{t}]
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#688D6C] block uppercase text-[11px]">&gt; YOUR FEEDBACK MESSAGE:</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter details on what felt confusing, broken, or ideas for improvement..."
              className="w-full bg-[#050805] border border-[#60FF70]/50 p-2.5 text-[#60FF70] placeholder-[#688D6C]/50 text-xs focus:outline-none focus:border-[#60FF70] resize-none"
            />
          </div>

          {savedMsg && (
            <div className="p-2 border border-[#60FF70] bg-[#123B17]/40 text-[#60FF70] text-[11px]">
              &gt; FEEDBACK SAVED LOCALLY. THANK YOU!
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-2 border-t border-[#60FF70]/20">
          <TerminalButton
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
            disabled={!message.trim()}
          >
            {copied ? 'COPIED TO CLIPBOARD!' : '[ COPY TEXT ]'}
          </TerminalButton>

          <TerminalButton
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            disabled={!message.trim()}
          >
            [ SUBMIT FEEDBACK ]
          </TerminalButton>
        </div>
      </div>
    </div>
  );
};

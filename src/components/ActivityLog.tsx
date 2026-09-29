import React from 'react';
import { TerminalWindow } from './TerminalWindow';
import type { ActivityItem } from '../hooks/useGoblinSession';

interface ActivityLogProps {
  logs: ActivityItem[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  return (
    <TerminalWindow title="LATEST ACTIVITY">
      <div className="space-y-2 pt-1 min-h-[120px] max-h-[160px] overflow-y-auto pr-1">
        {logs.map((log) => (
          <div key={log.id} className="flex justify-between items-center text-[11px] leading-tight font-mono">
            <span className="text-[#60FF70] truncate max-w-[130px]">
              {log.type}
            </span>
            <span className="text-[#688D6C] font-mono text-right pl-2">
              {log.detail}
            </span>
          </div>
        ))}

        <div className="flex justify-start text-[11px] text-[#688D6C] pt-1">
          <span>&gt; ...</span>
        </div>
      </div>
    </TerminalWindow>
  );
};

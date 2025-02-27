import { X } from "lucide-react";
import { Alert } from "../types";
import MetadataGrid from "./MetadataGrid";

interface DetailsPanelProps {
  alert: Alert;
  onClose: () => void;
}

const DetailsPanel = ({ alert, onClose }: DetailsPanelProps) => {
  const tags = alert.tags?.split(',')
    .map(tag => tag.trim().toUpperCase()) || [];

  return (
    <div className="h-full flex flex-col bg-[#1E1E2F] border-l border-purple-500/20">
      <div className="sticky top-0 z-10 flex-none p-4 border-b border-purple-500/20 bg-[#1E1E2F]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-purple-100 truncate pr-4">
            {alert.title || 'N/A'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-500/10 rounded-full transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-purple-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
          <h3 className="text-sm font-medium text-purple-200 mb-2">Description</h3>
          <p className="text-sm text-purple-100/70">{alert.description || 'N/A'}</p>
        </div>

        <MetadataGrid alert={alert} />

        {tags.length > 0 && (
          <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
            <h3 className="text-sm font-medium text-purple-200 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-full border border-purple-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {alert.tactics && (
          <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
            <h3 className="text-sm font-medium text-purple-200 mb-2">MITRE ATT&CK Tactics</h3>
            <div className="flex flex-wrap gap-2">
              {alert.tactics.split(',').map((tactic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-full border border-purple-500/20"
                >
                  {tactic.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {alert.techniques && (
          <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
            <h3 className="text-sm font-medium text-purple-200 mb-2">MITRE ATT&CK Techniques</h3>
            <div className="flex flex-wrap gap-2">
              {alert.techniques.split(',').map((technique, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded-full border border-indigo-500/20"
                >
                  {technique.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
          <h3 className="text-sm font-medium text-purple-200 mb-2">Raw Data</h3>
          <pre className="text-xs text-purple-100/70 whitespace-pre-wrap break-all bg-purple-950/30 p-4 rounded-lg overflow-x-auto">
            {typeof alert.raw === 'string' ? alert.raw : JSON.stringify(alert.raw, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;
import React from 'react';
import { CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy as CopyIcon } from 'lucide-react';

interface LatexCodeSectionProps {
  title?: string;
  description?: string;
  generatedLatex: string;
  onCopy: () => void;
}

const LatexCodeSection: React.FC<LatexCodeSectionProps & { onLatexEdit?: (code: string) => void; onSelectionChange?: (start: number, end: number) => void }> = ({
  title = 'LaTeX Source',
  description = 'Generated LaTeX code',
  generatedLatex,
  onCopy,
  onLatexEdit,
  onSelectionChange,
}) => {
  return (
    <div className="flex-1 bg-gray-900 text-gray-100 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📝</span>
            </div>
            <div>
              <div className="font-semibold text-lg">{title}</div>
              <div className="text-xs text-gray-300">{description}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={onCopy}
              disabled={!generatedLatex}
              className="p-2"
              title="Copy to clipboard"
            >
              <CopyIcon className="w-4 h-4" />
            </Button>
            <Badge variant="secondary">Overleaf Ready</Badge>
          </div>
        </CardHeader>
      </div>
      <div className="flex-1 overflow-auto">
        {generatedLatex ? (
          <textarea
            className="w-full h-full p-6 text-sm font-mono leading-relaxed text-green-300 bg-gray-900 resize-none border-none outline-none"
            value={generatedLatex}
            onChange={e => onLatexEdit && onLatexEdit(e.target.value)}
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement;
              onSelectionChange && onSelectionChange(target.selectionStart, target.selectionEnd);
            }}
            onKeyUp={(e) => {
              const target = e.target as HTMLTextAreaElement;
              onSelectionChange && onSelectionChange(target.selectionStart, target.selectionEnd);
            }}
            spellCheck={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📄</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-300 mb-3 font-aloevera">No LaTeX Code Yet</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-aloevera">
                Start editing to see the generated LaTeX code here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatexCodeSection;
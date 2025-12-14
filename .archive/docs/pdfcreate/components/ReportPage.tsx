import React from 'react';

interface ReportPageProps {
  children: React.ReactNode;
  pageNumber?: number;
  className?: string;
  hideFooter?: boolean;
}

export const ReportPage: React.FC<ReportPageProps> = ({ 
  children, 
  pageNumber, 
  className = "",
  hideFooter = false
}) => {
  return (
    <div className={`a4-page relative w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl mb-10 print:mb-0 print:shadow-none p-[25mm] flex flex-col justify-between ${className} print:break-after-page`}>
      {/* Content Area */}
      <div className="flex-grow">
        {children}
      </div>

      {/* Footer */}
      {!hideFooter && (
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brikx-600">Brikx</span>
            <span>|</span>
            <span>Programma van Eisen</span>
          </div>
          <div className="flex gap-4">
            <span>{new Date().toLocaleDateString()}</span>
            {pageNumber && <span>Pagina {pageNumber}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
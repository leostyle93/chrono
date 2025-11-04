import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import clsx from 'clsx';

// Extend the Window interface to include the PDF generation libraries loaded from CDN
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}


const Toolbar: React.FC = () => {
  const { openModal, isLinking, toggleLinkingMode, clearTimeline, openImportModal } = useTimelineStore();
  const { language, setLanguage } = useLanguageStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);


  const buttonStyle = "px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-md hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-md";
  const secondaryButtonStyle = "px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-md";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleSave = () => {
    const { items, links } = useTimelineStore.getState();
    const { backgroundColor, textColor, frameOpacity } = useThemeStore.getState();

    const dataToSave = {
      items,
      links,
      theme: { backgroundColor, textColor, frameOpacity },
    };

    const fileContent = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chronocraft-timeline.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        // Check for core data structure
        if (Array.isArray(parsedData.items) && Array.isArray(parsedData.links)) {
          useTimelineStore.getState().loadState({ items: parsedData.items, links: parsedData.links });
          // Check for and apply theme data if it exists (for backward compatibility)
          if (parsedData.theme) {
            useThemeStore.getState().loadTheme(parsedData.theme);
          }
        } else {
          alert('Invalid file format.');
        }
      } catch (error) {
        alert('Could not load file. It might be corrupted.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Allow re-loading the same file
  };
  
  const handleNew = () => {
    if (window.confirm('Are you sure you want to create a new timeline? All current data will be lost.')) {
      clearTimeline();
    }
  };
  
  const handleExportPdf = async () => {
    if (!window.jspdf || !window.html2canvas) {
      alert('PDF export libraries are not loaded yet. Please try again in a moment.');
      return;
    }

    setIsExporting(true);
    try {
      const timelineElement = document.getElementById('timeline-container');
      if (!timelineElement) {
        console.error("Timeline container not found for export.");
        alert("An error occurred during export: timeline container not found.");
        return;
      }
      
      const { jsPDF } = window.jspdf;
      const html2canvas = window.html2canvas;

      const canvas = await html2canvas(timelineElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: useThemeStore.getState().backgroundColor,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps= pdf.getImageProperties(imgData);
      const imgAspectRatio = imgProps.width / imgProps.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;

      let finalImgWidth, finalImgHeight;
      if (imgAspectRatio > pdfAspectRatio) {
        finalImgWidth = pdfWidth;
        finalImgHeight = pdfWidth / imgAspectRatio;
      } else {
        finalImgHeight = pdfHeight;
        finalImgWidth = pdfHeight * imgAspectRatio;
      }

      const x = (pdfWidth - finalImgWidth) / 2;
      const y = (pdfHeight - finalImgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
      pdf.save('chronocraft-timeline.pdf');

    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("An error occurred while exporting the timeline to PDF.");
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="flex items-center gap-4">
      {/* File Operations */}
      <div className="flex gap-2">
        <button onClick={handleNew} className={secondaryButtonStyle}>
          New
        </button>
        <label className={secondaryButtonStyle + ' cursor-pointer'}>
          Load
          <input type="file" className="hidden" accept=".json,application/json" onChange={handleLoad} />
        </label>
        <button onClick={handleSave} className={secondaryButtonStyle}>
          Save
        </button>
        <button 
          onClick={handleExportPdf}
          disabled={isExporting}
          className={clsx(secondaryButtonStyle, 'disabled:opacity-50 disabled:cursor-not-allowed')}
        >
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      <div className="w-px h-6 bg-white/20" />

      {/* Add Operations */}
      <div className="flex gap-2">
        <button onClick={() => openModal('event')} className={buttonStyle}>
          Add Event
        </button>
        <button onClick={() => openModal('period')} className={buttonStyle}>
          Add Period
        </button>
        <button onClick={() => openModal('frame')} className={buttonStyle}>
          Add Frame
        </button>
        <button 
          onClick={toggleLinkingMode} 
          className={clsx(buttonStyle, isLinking && 'bg-cyan-400 ring-2 ring-white')}
        >
          {isLinking ? 'Cancel Link' : 'Add Link'}
        </button>
        <button onClick={openImportModal} className={buttonStyle}>
          Import Text
        </button>
      </div>

      <div className="w-px h-6 bg-white/20" />

      {/* Language Switcher */}
      <div className="relative" ref={langMenuRef}>
        <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className={secondaryButtonStyle}>
          {language.toUpperCase()}
        </button>
        {isLangMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-28 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-30">
                <button onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600">English (EN)</button>
                <button onClick={() => { setLanguage('ru'); setIsLangMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600">Русский (RU)</button>
                <button onClick={() => { setLanguage('be'); setIsLangMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600">Беларуская (BE)</button>
            </div>
        )}
      </div>

    </div>
  );
};

export default Toolbar;
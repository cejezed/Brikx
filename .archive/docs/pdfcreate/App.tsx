import React, { useState } from 'react';
import { Printer, FileText, Info, CheckCircle2, Home, LayoutDashboard, Wallet, Zap, ShieldAlert, Layers, Ruler, Loader2, ArrowRight } from 'lucide-react';
import { ReportPage } from './components/ReportPage';
import { Logo } from './components/Logo';
import { SectionHeader, SubSectionHeader, Paragraph, BulletList, PriorityBadge } from './components/Section.tsx';
import { MOCK_DATA } from './constants';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const data = MOCK_DATA;

  // Function to handle browser native print (Best for PDF)
  const handlePrint = () => {
    window.print();
  };

  // Function to generate a Word-compatible HTML document
  const handleWordDownload = () => {
    setIsGenerating(true);

    try {
      const title = `PvE_${data.meta.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
      
      // Brand colors defined explicitly for inline usage
      const cTeal = '#0d9488';
      const cDark = '#0f766e';
      const cBg = '#f3f4f6';
      
      let content = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${title}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            /* Base Styles for Word */
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #333333; line-height: 1.5; }
            
            /* Headings */
            h1 { font-size: 28pt; color: ${cDark}; margin-bottom: 5px; font-weight: 700; }
            h2 { font-size: 16pt; color: ${cDark}; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid ${cTeal}; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            h3 { font-size: 12pt; color: ${cTeal}; margin-top: 15px; margin-bottom: 5px; font-weight: bold; }
            h4 { font-size: 11pt; font-weight: bold; margin-bottom: 2px; color: #444444; }
            
            /* Elements */
            p { margin-top: 0; margin-bottom: 10px; text-align: justify; }
            ul { margin-top: 5px; margin-bottom: 10px; }
            li { margin-bottom: 5px; }
            
            /* Tables (Critical for layout in Word) */
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            th { background-color: ${cTeal}; color: white; padding: 10px; text-align: left; font-weight: bold; border: 1px solid ${cDark}; }
            td { border: 1px solid #e5e7eb; padding: 8px; vertical-align: top; }
            
            /* Utility */
            .no-border td { border: none; }
            .bg-gray { background-color: ${cBg}; }
            .box { border: 1px solid #cccccc; padding: 15px; background-color: ${cBg}; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          
          <!-- COVER PAGE -->
          <div style="padding-top: 50px;">
            <p style="color: ${cTeal}; font-weight: bold; text-transform: uppercase; font-size: 10pt; letter-spacing: 2px;">Architectuurdossier</p>
            <h1>Programma van Eisen</h1>
            <p style="font-size: 20pt; color: #666666; margin-bottom: 40px;">
              ${data.meta.projectName} <span style="color: ${cTeal};">| ${data.meta.type}</span>
            </p>
            
            <div style="border-top: 4px solid ${cTeal}; padding-top: 30px; margin-top: 30px;">
              <table style="width: 100%; border: none;">
                <tr style="border: none;">
                  <td style="width: 30%; border: none; font-weight: bold; color: ${cDark}; padding: 5px 0;">Opdrachtgever</td>
                  <td style="border: none; padding: 5px 0;">${data.meta.clientName}</td>
                </tr>
                <tr style="border: none;">
                  <td style="border: none; font-weight: bold; color: ${cDark}; padding: 5px 0;">Locatie</td>
                  <td style="border: none; padding: 5px 0;">${data.meta.location}</td>
                </tr>
                <tr style="border: none;">
                  <td style="border: none; font-weight: bold; color: ${cDark}; padding: 5px 0;">Datum</td>
                  <td style="border: none; padding: 5px 0;">${data.meta.date}</td>
                </tr>
                <tr style="border: none;">
                  <td style="border: none; font-weight: bold; color: ${cDark}; padding: 5px 0;">Versie</td>
                  <td style="border: none; padding: 5px 0;">${data.meta.version}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin-top: 80px; text-align: right; font-size: 24pt; font-weight: bold; color: ${cTeal};">Brikx</p>
          </div>
          
          <div class="page-break"></div>

          <!-- 01 CONTEXT -->
          <h2>01. Projectcontext</h2>
          <p>${data.context.description}</p>
          
          <!-- Two column layout using table -->
          <table style="width: 100%; border: none; margin-top: 20px;">
            <tr>
              <td class="box" style="width: 48%; border: 1px solid #ccc;">
                <h4>Ervaring</h4>
                <p>${data.context.experienceLevel}</p>
              </td>
              <td style="width: 4%; border: none;"></td>
              <td class="box" style="width: 48%; border: 1px solid #ccc;">
                <h4>Planning</h4>
                <p>${data.context.planning}</p>
              </td>
            </tr>
          </table>

          <!-- 02 UITGANGSPUNTEN -->
          <h2>02. Uitgangspunten & Ambities</h2>
          <table style="width: 100%; border: none;">
             <tr>
               <td style="width: 50%; border: none; padding-right: 15px;">
                 <h3>Architectonisch</h3>
                 <ul>
                    ${data.ambitions.architectural.map(item => `<li>${item}</li>`).join('')}
                 </ul>
               </td>
               <td style="width: 50%; border: none; padding-left: 15px;">
                 <h3>Functioneel</h3>
                 <ul>
                    ${data.ambitions.functional.map(item => `<li>${item}</li>`).join('')}
                 </ul>
               </td>
             </tr>
          </table>
          
          <div class="box" style="margin-top: 15px; border-left: 5px solid ${cTeal};">
            <h4 style="color: ${cDark};">Persoonlijk / Gezin</h4>
            <ul>
               ${data.ambitions.personal.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>

          <!-- 03 PROGRAMMA -->
          <h2>03. Ruimtelijk Programma</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 30%">Ruimte</th>
                <th style="width: 10%; text-align: center;">Aantal</th>
                <th style="width: 15%; text-align: right;">Opp. (m²)</th>
                <th style="width: 45%">Bijzonderheden</th>
              </tr>
            </thead>
            <tbody>
              ${data.program.map(room => `
                <tr>
                  <td style="font-weight: bold;">${room.name}</td>
                  <td style="text-align: center;">${room.count}</td>
                  <td style="text-align: right;">${room.area}</td>
                  <td style="font-style: italic; color: #555;">${room.notes}</td>
                </tr>
              `).join('')}
              <tr style="background-color: ${cBg}; font-weight: bold;">
                <td>Totaal (indicatief)</td>
                <td></td>
                <td style="text-align: right;">${data.program.reduce((acc, r) => acc + (r.area * r.count), 0)} m²</td>
                <td>Excl. verkeersruimte</td>
              </tr>
            </tbody>
          </table>

          <div class="page-break"></div>

          <!-- 04 WENSEN -->
          <h2>04. Functionele Wensen</h2>
          <table>
             <thead>
               <tr>
                 <th style="width: 20%">Categorie</th>
                 <th style="width: 60%">Omschrijving</th>
                 <th style="width: 20%">Prioriteit</th>
               </tr>
             </thead>
             <tbody>
             ${data.wishes.map(w => `
                <tr>
                  <td style="font-weight: bold; color: #555;">${w.category}</td>
                  <td>${w.description}</td>
                  <td>
                    <span style="font-weight: bold; color: ${w.priority === 'Must' ? '#b91c1c' : (w.priority === 'Nice' ? cDark : '#6b7280')}">
                      ${w.priority}
                    </span>
                  </td>
                </tr>
             `).join('')}
             </tbody>
          </table>

          <!-- 05 BUDGET -->
          <h2>05. Budget & Kaders</h2>
          <div style="background-color: #1e293b; color: white; padding: 20px; border: 1px solid #000;">
             <h3 style="color: #99f6e4; margin-top: 0; border-bottom: none;">Indicatie Bouwbudget</h3>
             <p style="font-size: 24pt; margin: 10px 0; font-weight: bold;">€ ${data.budget.rangeStart.toLocaleString()} - € ${data.budget.rangeEnd.toLocaleString()}</p>
             <p style="font-size: 10pt; color: #cbd5e1; font-style: italic;">* ${data.budget.disclaimer}</p>
             <div style="border-top: 1px solid #334155; margin-top: 15px; padding-top: 10px;">
               <p style="margin:0;"><strong>Eigen inbreng:</strong> ${data.budget.selfWork}</p>
             </div>
          </div>

          <!-- 06 TECHNIEK -->
          <h2>06. Techniek & Duurzaamheid</h2>
          ${data.technical.map(t => `
            <div style="border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 10px; page-break-inside: avoid;">
               <h4 style="color: ${cDark}; margin-top: 0;">${t.category}</h4>
               <p style="margin: 5px 0;"><strong style="color: #555;">Huidig:</strong> ${t.current}</p>
               <p style="margin: 5px 0; background-color: ${cBg}; padding: 8px; border-left: 4px solid ${cTeal};">
                 <strong>Advies:</strong> ${t.attention}
               </p>
            </div>
          `).join('')}

          <div class="page-break"></div>

          <!-- 07 RISICO'S -->
          <h2>07. Risico's & Aandachtspunten</h2>
           ${data.risks.map(r => `
            <div style="border-left: 6px solid #f97316; background-color: #fff7ed; padding: 15px; margin-bottom: 15px; page-break-inside: avoid;">
               <p style="font-weight: bold; color: #c2410c; text-transform: uppercase; margin-top: 0; font-size: 9pt;">${r.type}</p>
               <p style="font-weight: bold; font-size: 11pt; margin-bottom: 5px;">${r.description}</p>
               <p style="font-style: italic; color: #666; font-size: 10pt; margin-bottom: 5px;">Gevolg: ${r.consequence}</p>
               <p style="margin-top: 5px; color: ${cDark}; font-weight: bold;">→ Mitigatie: ${r.mitigation}</p>
            </div>
          `).join('')}
          
          <!-- FOOTER -->
          <div style="margin-top: 50px; border-top: 1px solid #cccccc; padding-top: 10px; font-size: 9pt; color: #888888;">
            <p><strong>Disclaimer:</strong> Dit document is met zorg samengesteld op basis van de door opdrachtgever verstrekte informatie. Aan de inhoud kunnen geen rechten worden ontleend.</p>
          </div>

        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', content], {
        type: 'application/msword'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.doc`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error(e);
      alert("Er ging iets mis met de Word export.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-slate-800">
      
      {/* UI Navigation - Hidden when printing */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-4 flex justify-between items-center no-print">
        <Logo />
        <div className="flex gap-4">
           {/* Primary PDF method: Browser Print */}
           <button 
            onClick={handlePrint}
            className="flex items-center gap-2 text-slate-600 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors text-sm font-medium border border-transparent hover:border-slate-200"
            title="Gebruik de 'Opslaan als PDF' optie in het printscherm"
          >
            <Printer size={16} />
            Print / PDF
          </button>
          
          {/* Alternative: Word Export */}
          <button 
            onClick={handleWordDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-800 transition-all shadow-md hover:shadow-lg text-sm font-semibold tracking-wide disabled:opacity-70 disabled:cursor-wait"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {isGenerating ? 'Exporteren...' : 'Download Word'}
          </button>
        </div>
      </nav>

      <div className="no-print bg-blue-50 border-b border-blue-100 text-blue-800 px-6 py-2 text-xs text-center">
        <Info className="inline-block w-3 h-3 mr-1 mb-0.5" />
        Tip: Voor een PDF, klik op 'Print / PDF' en kies <strong>"Opslaan als PDF"</strong> bij bestemming.
      </div>

      {/* Main Document Container */}
      <div id="report-container" className="py-10 print:py-0 w-fit mx-auto transition-all">
        
        {/* PAGE 1: COVER */}
        <ReportPage hideFooter className="p-0 overflow-hidden bg-slate-900">
           {/* Split Layout Background */}
           <div className="absolute inset-0 flex flex-col h-full">
              <div className="h-2/3 bg-white relative p-[25mm]">
                  {/* Decorative geometrical elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brikx-50 rounded-bl-[100px] -mr-10 -mt-10"></div>
                  
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="mt-12">
                      <div className="inline-block px-3 py-1 bg-brikx-100 text-brikx-800 text-xs font-bold uppercase tracking-widest rounded mb-6">
                        Architectuurdossier
                      </div>
                      <h1 className="text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                        Programma <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brikx-600 to-brikx-400">van Eisen</span>
                      </h1>
                      <div className="w-24 h-2 bg-brikx-600 mb-8"></div>
                      <h2 className="text-2xl text-slate-500 font-light max-w-lg leading-snug">
                        {data.meta.projectName}
                        <span className="block text-brikx-600 font-medium mt-1">{data.meta.type}</span>
                      </h2>
                    </div>
                  </div>
              </div>
              
              <div className="h-1/3 bg-slate-900 relative p-[25mm] flex items-center">
                  <div className="grid grid-cols-2 gap-x-16 gap-y-8 w-full">
                    <div>
                      <h4 className="text-[10px] font-bold text-brikx-400 uppercase tracking-widest mb-2">Opdrachtgever</h4>
                      <p className="text-white text-lg font-medium">{data.meta.clientName}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-brikx-400 uppercase tracking-widest mb-2">Datum & Versie</h4>
                      <p className="text-white text-lg font-medium">{data.meta.date} <span className="text-slate-500 mx-2">|</span> {data.meta.version}</p>
                    </div>
                     <div>
                      <h4 className="text-[10px] font-bold text-brikx-400 uppercase tracking-widest mb-2">Locatie</h4>
                      <p className="text-white text-lg font-medium">{data.meta.location}</p>
                    </div>
                    <div className="flex items-end justify-end">
                       <Logo variant="white" className="scale-125" />
                    </div>
                  </div>
              </div>
           </div>
        </ReportPage>

        {/* PAGE 2: INDEX & CONTEXT */}
        <ReportPage pageNumber={2}>
          <div className="flex items-baseline justify-between border-b-2 border-slate-100 pb-4 mb-12">
             <h2 className="text-brikx-700 font-bold uppercase tracking-widest text-sm">Inhoudsopgave</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-12 mb-16">
             <ul className="space-y-4">
               {[
                 "Projectcontext", 
                 "Uitgangspunten & ambities", 
                 "Ruimtelijk programma", 
                 "Functionele wensen"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-4 group">
                   <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center group-hover:bg-brikx-600 group-hover:text-white transition-colors">0{i + 1}</span>
                   <span className="text-slate-700 font-medium text-sm">{item}</span>
                 </li>
               ))}
             </ul>
             <ul className="space-y-4">
               {[
                 "Budget & randvoorwaarden", 
                 "Techniek & duurzaamheid", 
                 "Risico's & aandachtspunten",
                 "Samenvatting & vervolg"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-4 group">
                   <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center group-hover:bg-brikx-600 group-hover:text-white transition-colors">0{i + 5}</span>
                   <span className="text-slate-700 font-medium text-sm">{item}</span>
                 </li>
               ))}
             </ul>
          </div>

          <SectionHeader title="Projectcontext" number="01" />
          
          <div className="flex gap-8 mb-8">
             <div className="w-2/3">
                <SubSectionHeader title="Omschrijving" />
                <Paragraph>{data.context.description}</Paragraph>
             </div>
             <div className="w-1/3 bg-brikx-50 p-6 rounded-sm border-l-4 border-brikx-500 h-fit">
                <h4 className="text-brikx-800 font-bold text-sm mb-3 flex items-center gap-2">
                  <Info size={16} /> Toelichting
                </h4>
                <p className="text-xs text-brikx-900 leading-relaxed opacity-80">
                  Dit document dient als startpunt. Het doel is niet om alles dicht te timmeren, maar om de juiste kaders te scheppen voor creativiteit.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6">
            <div>
              <SubSectionHeader title="Ervaring Opdrachtgever" />
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-sm border border-slate-100">{data.context.experienceLevel}</p>
            </div>
            <div>
              <SubSectionHeader title="Gewenste Planning" />
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-sm border border-slate-100">{data.context.planning}</p>
            </div>
          </div>
        </ReportPage>

        {/* PAGE 3: AMBITIONS & PROGRAM */}
        <ReportPage pageNumber={3}>
          <SectionHeader title="Uitgangspunten" number="02" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="bg-white">
               <div className="flex items-center gap-3 mb-4 pb-2 border-b border-brikx-100">
                 <div className="p-2 bg-brikx-50 rounded text-brikx-600"><Home size={18} /></div>
                 <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Architectonisch</h4>
               </div>
               <BulletList items={data.ambitions.architectural} />
            </div>
            <div className="bg-white">
               <div className="flex items-center gap-3 mb-4 pb-2 border-b border-brikx-100">
                 <div className="p-2 bg-brikx-50 rounded text-brikx-600"><LayoutDashboard size={18} /></div>
                 <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Functioneel</h4>
               </div>
               <BulletList items={data.ambitions.functional} />
            </div>
            <div className="col-span-1 md:col-span-2 bg-slate-50 p-6 rounded-lg border border-slate-100">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-white rounded text-brikx-600 shadow-sm"><CheckCircle2 size={18} /></div>
                 <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Persoonlijk / Gezin</h4>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 {data.ambitions.personal.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 bg-brikx-500 rounded-full"></div>
                      {item}
                    </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="mt-4">
            <SectionHeader title="Ruimtelijk Programma" number="03" />
            
            <div className="mt-6 border border-brikx-200 rounded-md overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-brikx-600 text-white font-medium">
                  <tr>
                    <th className="px-5 py-4 w-1/3">Ruimte</th>
                    <th className="px-5 py-4 w-20 text-center">Aantal</th>
                    <th className="px-5 py-4 w-28 text-right">Opp. (m²)</th>
                    <th className="px-5 py-4">Bijzonderheden</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {data.program.map((room) => (
                    <tr key={room.id} className="hover:bg-brikx-50/30 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-700">{room.name}</td>
                      <td className="px-5 py-3 text-center text-slate-500">{room.count}</td>
                      <td className="px-5 py-3 text-right text-slate-600 font-mono">{room.area} m²</td>
                      <td className="px-5 py-3 text-slate-500 text-xs italic">{room.notes}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-800 border-t-2 border-gray-200">
                    <td className="px-5 py-4">Totaal (indicatief)</td>
                    <td className="px-5 py-4"></td>
                    <td className="px-5 py-4 text-right font-mono text-brikx-700">
                      {data.program.reduce((acc, r) => acc + (r.area * r.count), 0)} m²
                    </td>
                    <td className="px-5 py-4 text-xs font-normal text-slate-500">Exclusief verkeersruimte en wanden</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ReportPage>

        {/* PAGE 4: WISHES, BUDGET, TECH */}
        <ReportPage pageNumber={4}>
          <SectionHeader title="Functionele Wensen" number="04" />
          
          <div className="grid grid-cols-1 gap-2 mb-12">
            {data.wishes.map((wish, idx) => (
              <div key={wish.id} className={`flex items-center justify-between p-4 rounded-md border ${idx % 2 === 0 ? 'bg-white border-gray-100' : 'bg-slate-50 border-transparent'}`}>
                <div className="flex items-center gap-4">
                  <span className="w-24 text-xs font-bold text-slate-400 uppercase tracking-wide">{wish.category}</span>
                  <span className="h-4 w-px bg-gray-200"></span>
                  <span className="text-sm text-slate-800 font-medium">{wish.description}</span>
                </div>
                <PriorityBadge level={wish.priority} />
              </div>
            ))}
          </div>

          <SectionHeader title="Budget & Kaders" number="05" />
          
          {/* Dark "Feature Card" for Budget to make it stand out */}
          <div className="bg-slate-900 text-white p-8 rounded-lg shadow-xl relative overflow-hidden mb-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brikx-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-20 -translate-y-20"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2 text-brikx-300">
                  <Wallet size={20} />
                  <h3 className="font-bold text-sm uppercase tracking-widest">Indicatie Bouwbudget</h3>
                </div>
                <p className="text-4xl font-light text-white tracking-tight">
                  € {data.budget.rangeStart.toLocaleString()} <span className="text-slate-500 mx-2">-</span> € {data.budget.rangeEnd.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-2">* {data.budget.disclaimer}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur p-4 rounded border border-white/10 max-w-xs">
                 <p className="text-xs text-brikx-100 font-semibold mb-1">Eigen inbreng</p>
                 <p className="text-sm text-white leading-snug">{data.budget.selfWork}</p>
              </div>
            </div>
          </div>

          <SectionHeader title="Techniek & Duurzaamheid" number="06" />
          <div className="grid grid-cols-1 gap-4">
             {data.technical.map((item, idx) => (
               <div key={idx} className="flex gap-5 p-5 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                 <div className="bg-brikx-50 p-3 rounded-md h-fit text-brikx-600">
                    <Zap size={20} />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-slate-800 mb-1">{item.category}</h4>
                   <div className="flex gap-2 text-xs text-slate-500 mb-2">
                      <span className="uppercase tracking-wider font-semibold">Huidig:</span> 
                      <span>{item.current}</span>
                   </div>
                   <p className="text-sm text-brikx-700 bg-brikx-50/50 p-2 rounded border border-brikx-100 inline-block">
                     <span className="font-semibold mr-1">Advies:</span> {item.attention}
                   </p>
                 </div>
               </div>
             ))}
          </div>
        </ReportPage>

        {/* PAGE 5: RISKS & SUMMARY */}
        <ReportPage pageNumber={5}>
          <SectionHeader title="Risico's & Aandachtspunten" number="07" />
          
          <div className="space-y-4 mb-12">
            {data.risks.map((risk, idx) => (
              <div key={idx} className="flex items-stretch bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="w-2 bg-orange-400"></div>
                <div className="p-5 flex-grow">
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="text-orange-500" size={18} />
                        <span className="font-bold text-slate-700 text-sm uppercase">{risk.type}</span>
                      </div>
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">Risico</span>
                   </div>
                   <p className="text-slate-800 font-medium mb-1 text-sm">{risk.description}</p>
                   <p className="text-slate-500 text-xs italic mb-4">Gevolg: {risk.consequence}</p>
                   
                   <div className="flex items-center gap-2 text-xs font-bold text-brikx-700 bg-brikx-50 p-2 rounded border border-brikx-100 w-fit">
                     <ArrowRight size={14} />
                     Mitigatie: {risk.mitigation}
                   </div>
                </div>
              </div>
            ))}
          </div>

          <SectionHeader title="Samenvatting & Vervolg" number="08" />
          <div className="flex gap-6 mb-10">
            <div className="w-1/2">
                <Paragraph>
                  Met dit Programma van Eisen ligt er een solide fundament voor de volgende fase. De wensen zijn duidelijk, de kaders zijn geschetst en de risico's zijn in beeld gebracht.
                </Paragraph>
            </div>
            <div className="w-1/2 flex items-center justify-center">
               <div className="flex items-center gap-2 text-brikx-200">
                  <Layers size={64} strokeWidth={1} />
                  <Ruler size={48} strokeWidth={1} />
               </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-300">
            <h3 className="text-sm font-bold text-slate-800 mb-6 text-center uppercase tracking-widest">Roadmap</h3>
            <div className="flex justify-between relative">
              {/* Connection Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -mt-4"></div>
              
              {[
                { step: "01", text: "Schetsontwerp", icon: <Layers size={16}/> },
                { step: "02", text: "Kostenraming", icon: <Wallet size={16}/> },
                { step: "03", text: "Vergunning", icon: <CheckCircle2 size={16}/> }
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center bg-slate-50 px-4">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-brikx-500 text-brikx-600 flex items-center justify-center shadow-sm mb-3 z-10">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-400 mb-1">{s.step}</span>
                  <span className="text-sm font-bold text-slate-800">{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Disclaimer</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
              Dit document is met zorg samengesteld op basis van de door opdrachtgever verstrekte informatie. Het dient als informatief uitgangspunt voor het ontwerpproces. Aan de inhoud, maatvoeringen en financiële indicaties kunnen geen rechten worden ontleend. Dit document vervangt geen technische tekeningen, constructieberekeningen of officiële aannemersbegrotingen. Brikx adviseert altijd om voor structurele wijzigingen en exacte kostenramingen specialisten te raadplegen.
            </p>
          </div>
        </ReportPage>

      </div>
    </div>
  );
};

export default App;
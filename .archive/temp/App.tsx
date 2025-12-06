import React, { useState } from 'react';
import { StepId, FormData, ChatMessage } from './types';
import { WIZARD_STEPS, INITIAL_CHAT_MESSAGES, EXPERT_TIPS } from './constants';
import { JulesChat } from './components/JulesChat';
import { WizardForm } from './components/WizardForm';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { Menu, X, LogOut, LayoutGrid, Save, Construction, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'wizard'>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentStepId, setCurrentStepId] = useState<StepId>(StepId.BASIS);
  const [formData, setFormData] = useState<FormData>({
    projectName: 'Nieuwe Uitbouw',
    location: '',
    budget: '',
    size: 'large',
    timeline: '',
    experience: '',
    description: ''
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const startWizard = () => setView('wizard');
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';

  const handleStepChange = (id: StepId) => {
    setCurrentStepId(id);
    setMobileMenuOpen(false);
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'jules',
        text: "Dat is genoteerd. Is er nog iets specifieks waar ik rekening mee moet houden qua stijl?",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  const handleTriggerAI = (context: string) => {
    let aiText = "";
    switch(context) {
        case 'budget_help':
            aiText = "Voor een uitbouw van deze grootte moet u rekenen op ongeveer €2.500 - €3.500 per m². Zal ik een ruwe schatting voor u maken?";
            break;
        case 'timeline_urgent':
            aiText = "Oei, 'Direct' is ambitieus! 🚀 Houdt u er rekening mee dat een vergunningsaanvraag bij de gemeente al snel 8 weken duurt?";
            break;
        case 'timeline_long':
            aiText = "Heel verstandig om ruim de tijd te nemen. Dat geeft ons de ruimte om het ontwerp tot in de puntjes uit te werken.";
            break;
        default: return;
    }
    setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'jules',
        text: aiText,
        timestamp: new Date()
    }]);
  };

  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === currentStepId);
  const progressPercentage = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;

  if (view === 'landing') {
    return <LandingPage onStart={startWizard} />;
  }

  // Dynamic Styles based on Theme
  const bgClass = isDark 
    ? 'bg-[#0F172A] text-slate-100' 
    : 'bg-slate-200 text-slate-900'; // Slightly darker background in light mode for contrast

  const containerClass = isDark 
    ? 'bg-slate-900/40 border-white/10 shadow-black/50 backdrop-blur-[40px]' 
    : 'bg-white/40 border-white/40 shadow-2xl shadow-slate-400/20 backdrop-blur-[60px]'; 

  // CHAT PANEL: Now the visual leader.
  // In Light Mode: Slightly darker/solid than the content panel to pop out.
  // Shadow: Strong shadow to the right to imply it sits "above" the form.
  const chatPanelClass = isDark 
    ? 'bg-slate-950/60 border-r border-white/10 backdrop-blur-2xl shadow-[20px_0_50px_-10px_rgba(0,0,0,0.5)]' 
    : 'bg-white/70 border-r border-white/60 backdrop-blur-2xl shadow-[20px_0_50px_-10px_rgba(148,163,184,0.3)]';

  // CONTENT PANEL: Sits "behind" or is secondary.
  const contentPanelClass = isDark 
    ? 'bg-slate-900/40' 
    : 'bg-white/30'; // Very transparent in light mode

  const headerBorderClass = isDark 
    ? 'border-white/5' 
    : 'border-white/40';

  const navPanelClass = isDark 
    ? 'bg-slate-900/30 border-white/5 backdrop-blur-md' 
    : 'bg-white/30 border-white/40 backdrop-blur-md';

  const iconBtnClass = isDark 
    ? 'text-slate-400 hover:text-white hover:bg-white/5' 
    : 'text-slate-500 hover:text-brikx-600 hover:bg-white/60';

  return (
    <div className={`h-screen w-full font-sans overflow-hidden relative flex items-center justify-center p-0 lg:p-6 transition-colors duration-500 ${bgClass}`}>
      
      {/* 1. Global Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none transition-opacity duration-700">
          <div className={`absolute top-[-20%] left-[-10%] w-[60rem] h-[60rem] rounded-full mix-blend-screen filter blur-[100px] animate-blob ${isDark ? 'bg-brikx-500/10' : 'bg-brikx-400/30 mix-blend-multiply opacity-80'}`}></div>
          <div className={`absolute top-[10%] right-[-10%] w-[50rem] h-[50rem] rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 ${isDark ? 'bg-indigo-500/10' : 'bg-blue-400/30 mix-blend-multiply opacity-80'}`}></div>
          <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] ${isDark ? 'opacity-20 brightness-100 contrast-150' : 'opacity-30 mix-blend-overlay'}`}></div>
      </div>

      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 flex flex-col border-b shadow-lg backdrop-blur-md ${isDark ? 'bg-[#0F172A]/90 border-white/10 text-white' : 'bg-white/80 border-slate-200 text-slate-900'}`}>
        <div className="h-16 flex items-center justify-between px-4">
            <div className="font-bold text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-brikx-400 to-brikx-600 text-white flex items-center justify-center font-bold">B</div>
            <span className="tracking-tight">Brikx</span>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 opacity-80">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
        <div className={`w-full h-1 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
            <div className="h-full bg-brikx-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      {/* 2. Main Dashboard Shell */}
      <div className={`w-full h-full lg:max-w-[1800px] lg:h-[94vh] border lg:rounded-[2.5rem] relative z-10 flex flex-col lg:flex-row overflow-hidden mt-16 lg:mt-0 transition-all duration-500 ${containerClass}`}>
        
        {/* Left: Chat Panel - NOW LARGER (Leading) */}
        <div className={`
            absolute inset-0 z-50 lg:relative lg:z-30 
            lg:w-[45%] lg:min-w-[450px] lg:max-w-[800px] 
            flex flex-col transition-transform duration-500
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${chatPanelClass}
        `}>
             <JulesChat messages={chatMessages} onSendMessage={handleSendMessage} theme={theme} />
        </div>

        {/* Middle: Content Area - Secondary */}
        <div className={`flex-1 flex flex-col min-w-0 relative z-10 transition-colors duration-500 ${contentPanelClass}`}>
            
            {/* Top Toolbar */}
            <header className={`h-20 px-8 flex items-center justify-between z-20 border-b transition-colors duration-500 ${headerBorderClass}`}>
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10 text-brikx-400' : 'bg-white/60 border-white/50 text-brikx-600 shadow-sm'}`}>
                        <LayoutGrid size={18} />
                    </div>
                    <div>
                        <span className={`block text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Resultaat</span>
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{formData.projectName || 'Naamloos Project'}</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${iconBtnClass}`}
                        title="Wissel Thema"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <div className={`h-6 w-px mx-2 ${isDark ? 'bg-white/10' : 'bg-slate-300/40'}`}></div>

                    <button className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors ${iconBtnClass}`}>
                        <Save size={16} />
                        <span className="hidden sm:inline">Opslaan</span>
                    </button>
                    <button onClick={() => setView('landing')} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`}>
                        <LogOut size={16} />
                    </button>
                 </div>
            </header>

            {/* Scrollable Form Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-12 py-4 scroll-smooth">
                <div className="max-w-3xl mx-auto pb-32 pt-4">
                    {currentStepId === StepId.BASIS ? (
                        <WizardForm 
                            formData={formData} 
                            onChange={handleFormChange} 
                            onTriggerAI={handleTriggerAI}
                            theme={theme}
                        />
                    ) : (
                        <div className="h-[50vh] flex flex-col items-center justify-center text-center opacity-40">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/60 shadow-lg shadow-slate-200'}`}>
                                <Construction size={32} className={isDark ? "text-slate-400" : "text-brikx-500"} />
                            </div>
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{WIZARD_STEPS.find(s => s.id === currentStepId)?.label}</h2>
                            <p className="text-slate-400 mt-2">Dit hoofdstuk is nog in ontwikkeling.</p>
                            <button onClick={() => setCurrentStepId(StepId.BASIS)} className="mt-6 text-sm font-bold text-brikx-500 underline hover:text-brikx-400">
                                Terug naar Basis
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Action Bar (Sticky) */}
            <div className={`absolute bottom-0 inset-x-0 p-6 backdrop-blur-xl flex items-center justify-between z-20 transition-all duration-500 ${isDark ? 'bg-slate-900/80 border-t border-white/5' : 'bg-white/60 border-t border-white/40'}`}>
                 <button 
                    onClick={() => {
                        const idx = WIZARD_STEPS.findIndex(s => s.id === currentStepId);
                        if(idx > 0) handleStepChange(WIZARD_STEPS[idx-1].id);
                    }}
                    disabled={currentStepIndex === 0}
                    className={`px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-0 transition-all border border-transparent ${iconBtnClass}`}
                >
                    Vorige Stap
                </button>
                <button 
                    onClick={() => {
                        const idx = WIZARD_STEPS.findIndex(s => s.id === currentStepId);
                        if(idx < WIZARD_STEPS.length - 1) handleStepChange(WIZARD_STEPS[idx+1].id);
                    }}
                    className={`px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 group ${isDark ? 'bg-white text-slate-900 shadow-white/10 hover:bg-slate-200' : 'bg-slate-800 text-white shadow-slate-400/50 hover:bg-slate-900'}`}
                >
                    <span>Volgende Stap</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-slate-900/10 group-hover:bg-slate-900/20' : 'bg-white/20 group-hover:bg-white/30'}`}>
                        <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-900' : 'bg-white'}`}></div>
                    </div>
                </button>
            </div>
        </div>

        {/* Right: Navigation Panel - Reduced visibility/width to give space to chat */}
        <div className={`hidden 2xl:block w-[260px] relative z-10 border-l transition-colors duration-500 ${navPanelClass}`}>
             <Navigation 
                steps={WIZARD_STEPS} 
                currentStepId={currentStepId} 
                onStepClick={handleStepChange}
                tips={EXPERT_TIPS[currentStepId] || []}
                theme={theme}
            />
        </div>

      </div>
    </div>
  );
};

export default App;
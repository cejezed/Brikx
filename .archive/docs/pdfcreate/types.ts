export interface Room {
  id: string;
  name: string;
  count: number;
  area: number; // in m2
  notes: string;
}

export interface Wish {
  id: string;
  category: string;
  description: string;
  priority: 'Must' | 'Nice' | 'Optioneel';
}

export interface Risk {
  type: 'Budget' | 'Techniek' | 'Planning' | 'Proces';
  description: string;
  consequence: string;
  mitigation: string;
}

export interface TechnicalItem {
  category: string;
  current: string;
  attention: string;
}

export interface ProjectData {
  meta: {
    projectName: string;
    type: string; // Nieuwbouw / Verbouwing
    date: string;
    version: string;
    clientName: string;
    location: string;
  };
  context: {
    description: string;
    experienceLevel: string;
    planning: string;
  };
  ambitions: {
    architectural: string[];
    functional: string[];
    personal: string[];
  };
  program: Room[];
  wishes: Wish[];
  budget: {
    rangeStart: number;
    rangeEnd: number;
    disclaimer: string;
    selfWork: string;
  };
  technical: TechnicalItem[];
  risks: Risk[];
}
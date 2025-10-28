export type TipItem = { id: string; text: string; severity?: "info"|"warning"|"danger" };
export type Rules = Record<string, TipItem[]>;

const rules: Rules = {
  intake: [
    { id: "budget", text: "Werk met een bandbreedte (bijv. €250k–€300k) i.p.v. één bedrag.", severity: "info" },
    { id: "intent", text: "Kies ‘scenario’s verkennen’ als vergunning/onzekerheden nog groot zijn.", severity: "info" },
    { id: "projectType", text: "Bij verbouwing: check erfgrens/geluidsnormen vroegtijdig.", severity: "warning" },
  ],
  basis: [
    { id: "locatie", text: "Bestemmingsplan en welstandsnota zijn locatie-gebonden; noteer minimaal de plaats.", severity: "info" },
    { id: "oppervlakteM2", text: "Oppervlakte is indicatief; wijkt dit >15% af, herzie later het budget.", severity: "warning" },
  ],
  techniek: [
    { id: "warmtepomp", text: "Buitenunit: houd < 40 dB op de perceelgrens aan (gemeentelijke eisen).", severity: "info" },
  ],
  ruimtes: [
    { id: "hoogte", text: "Controleer max. nok- en goothoogte in bestemmingsplan.", severity: "info" },
  ],
  budget: [
    { id: "totaalBudget", text: "Reserveer 10–15% onvoorzien voor meerwerk/onvoorziene kosten.", severity: "warning" },
  ],
};

export default rules;

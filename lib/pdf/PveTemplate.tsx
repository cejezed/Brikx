// lib/pdf/PveTemplate.tsx
// ✅ v3.14: MoSCoW priorities in Wensen sectie
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  formatWishPriorityLabel,
  formatWishCategoryLabel,
  getPriorityColor
} from '@/lib/pve/wishPriority';

// ✅ Lokale, tolerante definitie (ipv import uit ./DossierChecklist)
export type DocumentStatus = {
  moodboard?: boolean | null;
  existingDrawings?: boolean | null;
  kavelpaspoort?: boolean | null;
  existingPermits?: boolean | null;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #1A3E4C',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#1A3E4C',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A3E4C',
    marginBottom: 10,
    backgroundColor: '#F5F7F9',
    padding: 8,
  },
  field: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 11,
    color: '#000',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    // Opmerking: React-PDF kent geen CSS transform-string; eenvoudige tekst volstaat hier.
    // Voor een echte diagonale watermark kun je <Text rotate={-45}> gebruiken.
    fontSize: 60,
    color: '#E0E0E0',
    opacity: 0.3,
  },
  disclaimer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FFF9E6',
    border: '1 solid #FFD700',
    fontSize: 9,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
  },
  // ✅ v3.14: MoSCoW Wensen tabel styles
  wishTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 6,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
  },
  wishTableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  wishColPriority: {
    width: '22%',
    fontSize: 9,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  wishColCategory: {
    width: '18%',
    fontSize: 9,
    color: '#64748B',
  },
  wishColText: {
    width: '60%',
    fontSize: 10,
    color: '#1E293B',
  },
});

interface PveTemplateProps {
  // ✅ Match wizard datastructuur, velden facultatief en defensief gelezen
  data: {
    triage?: any;
    basis?: any;
    wensen?: any;
    budget?: any;
    ruimtes?: any;
    techniek?: any;
    duurzaamheid?: any;
    risico?: any;
  };
  isPremium: boolean;
  documentStatus?: DocumentStatus | null;
}

export const PveTemplate = ({ data, isPremium, documentStatus }: PveTemplateProps) => {
  const basis = data.basis || {};
  const triage = data.triage || {};
  const wensen = data.wensen || {};
  const budget = data.budget || {};
  const ruimtes = data.ruimtes || [];
  const techniek = data.techniek || {};
  const duurzaamheid = data.duurzaamheid || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {!isPremium && <Text style={styles.watermark}>BRIKX PREVIEW</Text>}

        <View style={styles.header}>
          <Text style={styles.title}>Programma van Eisen</Text>
          <Text style={styles.subtitle}>
            Gegenereerd door Brikx • {new Date().toLocaleDateString('nl-NL')}
          </Text>
        </View>

        {/* 1. PROJECT BASIS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Projectbasis</Text>

          {triage.projectType && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Projecttype</Text>
              <Text style={styles.fieldValue}>
                {Array.isArray(triage.projectType) ? triage.projectType.join(', ') : triage.projectType}
              </Text>
            </View>
          )}

          {basis.projectNaam && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Projectnaam</Text>
              <Text style={styles.fieldValue}>{basis.projectNaam}</Text>
            </View>
          )}

          {basis.locatie && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Locatie</Text>
              <Text style={styles.fieldValue}>{basis.locatie}</Text>
            </View>
          )}

          {basis.beschrijving && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Beschrijving</Text>
              <Text style={styles.fieldValue}>{basis.beschrijving}</Text>
            </View>
          )}

          {basis.oppervlakte && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Oppervlakte</Text>
              <Text style={styles.fieldValue}>{basis.oppervlakte} m²</Text>
            </View>
          )}
        </View>

        {/* 2. BUDGET (Premium) */}
        {isPremium && budget.bedrag && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Budget</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Budget</Text>
              <Text style={styles.fieldValue}>€ {Number(budget.bedrag).toLocaleString('nl-NL')}</Text>
            </View>
            {budget.fasering && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Fasering</Text>
                <Text style={styles.fieldValue}>{budget.fasering}</Text>
              </View>
            )}
          </View>
        )}

        {/* 3. RUIMTES */}
        {Array.isArray(ruimtes) && ruimtes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Ruimtes</Text>
            {ruimtes.map((ruimte: any, idx: number) => (
              <View key={idx} style={styles.field}>
                <Text style={styles.fieldLabel}>{ruimte.naam || ruimte.type || `Ruimte ${idx + 1}`}</Text>
                {ruimte.oppervlakte && (
                  <Text style={styles.fieldValue}>• Oppervlakte: {ruimte.oppervlakte} m²</Text>
                )}
                {Array.isArray(ruimte.wensen) && ruimte.wensen.length > 0 && (
                  <Text style={styles.fieldValue}>• Wensen: {ruimte.wensen.join(', ')}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 4. WENSEN MET MOSCOW PRIORITEITEN */}
        {Array.isArray(wensen) && wensen.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Wensen & Prioriteiten (MoSCoW)</Text>

            {/* Table header */}
            <View style={styles.wishTableHeader}>
              <Text style={styles.wishColPriority}>Prioriteit</Text>
              <Text style={styles.wishColCategory}>Categorie</Text>
              <Text style={styles.wishColText}>Beschrijving</Text>
            </View>

            {/* Table rows */}
            {wensen.map((wish: any, idx: number) => {
              const priority = wish?.priority;
              const colors = getPriorityColor(priority);
              return (
                <View key={idx} style={styles.wishTableRow}>
                  <View style={[styles.wishColPriority, { backgroundColor: colors.bg }]}>
                    <Text style={{ color: colors.text, fontSize: 9 }}>
                      {formatWishPriorityLabel(priority)}
                    </Text>
                  </View>
                  <Text style={styles.wishColCategory}>
                    {formatWishCategoryLabel(wish?.category)}
                  </Text>
                  <Text style={styles.wishColText}>
                    {typeof wish === 'string' ? wish : wish.text || String(wish)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* 5. TECHNIEK (Premium) */}
        {isPremium && techniek && Object.keys(techniek).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Techniek & Installaties</Text>
            {Object.entries(techniek).map(([key, value], idx) =>
              value ? (
                <View key={idx} style={styles.field}>
                  <Text style={styles.fieldLabel}>{key}</Text>
                  <Text style={styles.fieldValue}>{String(value)}</Text>
                </View>
              ) : null
            )}
          </View>
        )}

        {/* 6. DUURZAAMHEID (Premium) */}
        {isPremium && duurzaamheid && Object.keys(duurzaamheid).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Duurzaamheid</Text>
            {Object.entries(duurzaamheid).map(([key, value], idx) =>
              value ? (
                <View key={idx} style={styles.field}>
                  <Text style={styles.fieldLabel}>{key}</Text>
                  <Text style={styles.fieldValue}>{String(value)}</Text>
                </View>
              ) : null
            )}
          </View>
        )}

        {/* 7. DOCUMENT STATUS */}
        {documentStatus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Projectdossier</Text>

            {documentStatus.moodboard !== undefined && documentStatus.moodboard !== null && (
              <View style={styles.field}>
                <Text style={styles.fieldValue}>
                  • Moodboard: {documentStatus.moodboard ? 'Beschikbaar ✓' : 'Niet beschikbaar'}
                </Text>
              </View>
            )}

            {documentStatus.existingDrawings !== undefined &&
              documentStatus.existingDrawings !== null && (
                <View style={styles.field}>
                  <Text style={styles.fieldValue}>
                    • Bouwtekeningen: {documentStatus.existingDrawings ? 'Beschikbaar ✓' : 'Niet beschikbaar'}
                  </Text>
                </View>
              )}

            {documentStatus.kavelpaspoort !== undefined &&
              documentStatus.kavelpaspoort !== null && (
                <View style={styles.field}>
                  <Text style={styles.fieldValue}>
                    • Kavelpaspoort: {documentStatus.kavelpaspoort ? 'Beschikbaar ✓' : 'Niet beschikbaar'}
                  </Text>
                </View>
              )}

            {documentStatus.existingPermits !== undefined &&
              documentStatus.existingPermits !== null && (
                <View style={styles.field}>
                  <Text style={styles.fieldValue}>
                    • Vergunningen: {documentStatus.existingPermits ? 'Beschikbaar ✓' : 'Niet beschikbaar'}
                  </Text>
                </View>
              )}
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text>
            Dit document is gegenereerd door Brikx en dient als uitgangspunt voor verder onderzoek.
            Het vervangt geen professioneel advies van een architect, aannemer of andere bouwprofessionals.
            Aan deze indicaties kunnen geen rechten worden ontleend.
          </Text>
        </View>

        <Text style={styles.footer}>Brikx • Slim bouwen zonder spijt • www.brikx.nl</Text>
      </Page>
    </Document>
  );
};

export default PveTemplate;

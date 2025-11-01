// emails/PdfDownloadEmail.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface PdfDownloadEmailProps {
  projectName: string;
  isPremium: boolean;
  downloadUrl: string;
  documentCount?: number;
}

export default function PdfDownloadEmail({
  projectName = 'Mijn Project',
  isPremium = false,
  downloadUrl,
  documentCount = 0,
}: PdfDownloadEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Je Programma van Eisen is gereed! 📄</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>Brikx</Text>
            <Text style={headerSubtitle}>Slim bouwen zonder spijt</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hallo,</Text>
            
            <Text style={body}>
              Gefeliciteerd! 🎉 Je Programma van Eisen voor <strong>{projectName}</strong> is gereed!
            </Text>

            {/* ✅ Added documentCount message */}
            {documentCount > 0 && (
              <Text style={body}>
                Je PDF bevat ook "Bijlage A" met een overzicht van {documentCount} beschikbare projectdocumenten.
              </Text>
            )}

            {/* Download Button */}
            <Section style={buttonContainer}>
              <Button style={downloadButton} href={downloadUrl}>
                📥 Download je PDF
              </Button>
            </Section>

            {/* Tier info */}
            {isPremium ? (
              <Section style={premiumBanner}>
                <Text style={premiumText}>
                  ✨ <strong>Premium Versie</strong>
                </Text>
                <Text style={premiumDescription}>
                  Geen watermerk • Volledige content • Kostenbandbreedtes • Risico-analyse
                </Text>
              </Section>
            ) : (
              <Section style={freeBanner}>
                <Text style={freeText}>
                  📄 <strong>Gratis Versie</strong>
                </Text>
                <Text style={freeDescription}>
                  Dit is een preview met Brikx watermerk. Upgrade naar Premium voor volledige toegang.
                </Text>
              </Section>
            )}

            {/* Next Steps */}
            <Hr style={divider} />
            
            <Text style={sectionTitle}>📋 Volgende stappen:</Text>
            
            <Section style={stepsList}>
              <Row style={step}>
                <Text style={stepNumber}>1</Text>
                <Text style={stepText}>
                  <strong>Download je PvE</strong> - Bekijk alle ingevulde informatie
                </Text>
              </Row>
              <Row style={step}>
                <Text style={stepNumber}>2</Text>
                <Text style={stepText}>
                  <strong>Deel met je architect</strong> - Gebruik dit als basis voor het eerste gesprek
                </Text>
              </Row>
              <Row style={step}>
                <Text style={stepNumber}>3</Text>
                <Text style={stepText}>
                  <strong>Vraag offertes aan</strong> - Deel met potentiële bouwers/architecten
                </Text>
              </Row>
            </Section>

            {/* CTA for Premium */}
            {!isPremium && (
              <Section style={upgradeContainer}>
                <Text style={upgradeTitle}>Wil je Premium?</Text>
                <Text style={upgradeText}>
                  Upgrade nu en krijg toegang tot budget analyses, technische specificaties en een watermerkvrije PDF.
                </Text>
                <Button style={upgradeButton} href="https://app.brikx.nl/upgrade">
                  🚀 Upgrade naar Premium
                </Button>
              </Section>
            )}

            {/* FAQ */}
            <Hr style={divider} />
            
            <Text style={sectionTitle}>❓ Veelgestelde vragen</Text>
            
            <Text style={faqQuestion}>
              <strong>Kan ik mijn PvE aanpassen?</strong>
            </Text>
            <Text style={faqAnswer}>
              Ja! Log in op Brikx en je kunt je project op elk moment aanpassen. Download vervolgens de geüpdatete versie.
            </Text>

            <Text style={faqQuestion}>
              <strong>Hoe lang is mijn PvE geldig?</strong>
            </Text>
            <Text style={faqAnswer}>
              Je project wordt 1 jaar opgeslagen. Na 1 jaar kan je het nog bekijken maar niet meer aanpassen.
            </Text>

            <Text style={faqQuestion}>
              <strong>Kan ik mijn project delen met anderen?</strong>
            </Text>
            <Text style={faqAnswer}>
              Ja, je kunt je project exporteren als PDF en delen. Premium versies hebben geen watermerk.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          
          <Section style={footer}>
            <Text style={footerText}>
              Je ontvangt deze email omdat je een Programma van Eisen hebt gedownload op Brikx.
            </Text>
            
            <Row style={footerLinks}>
              <Text style={footerLink}>
                <Link href="https://brikx.nl" style={link}>
                  Website
                </Link>
              </Text>
              <Text style={footerLink}> • </Text>
              <Text style={footerLink}>
                <Link href="https://app.brikx.nl/settings" style={link}>
                  Instellingen
                </Link>
              </Text>
              <Text style={footerLink}> • </Text>
              <Text style={footerLink}>
                <Link href="https://brikx.nl/contact" style={link}>
                  Contact
                </Link>
              </Text>
            </Row>

            <Text style={copyright}>
              © 2025 Brikx. Alle rechten voorbehouden.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f5f7f9',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '20px',
};

const header = {
  backgroundColor: '#1A3E4C',
  color: '#ffffff',
  padding: '24px',
  textAlign: 'center' as const,
};

const headerTitle = {
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const headerSubtitle = {
  fontSize: '14px',
  opacity: 0.9,
  margin: '0',
};

const content = {
  padding: '24px',
};

const greeting = {
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 12px 0',
};

const body = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px 0',
  color: '#1A3E4C',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const downloadButton = {
  backgroundColor: '#40C0C0',
  color: '#ffffff',
  padding: '12px 32px',
  fontSize: '16px',
  fontWeight: 'bold',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
};

const premiumBanner = {
  backgroundColor: '#F0F9FF',
  border: '1px solid #BAE6FD',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
};

const premiumText = {
  fontSize: '14px',
  color: '#0369A1',
  margin: '0 0 8px 0',
};

const premiumDescription = {
  fontSize: '13px',
  color: '#0C4A6E',
  margin: '0',
};

const freeBanner = {
  backgroundColor: '#FFFBEB',
  border: '1px solid #FCD34D',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
};

const freeText = {
  fontSize: '14px',
  color: '#92400E',
  margin: '0 0 8px 0',
};

const freeDescription = {
  fontSize: '13px',
  color: '#78350F',
  margin: '0',
};

const divider = {
  borderColor: '#E5E7EB',
  margin: '24px 0',
};

const sectionTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1A3E4C',
  margin: '24px 0 12px 0',
};

const stepsList = {
  margin: '12px 0 24px 0',
};

const step = {
  margin: '12px 0',
};

const stepNumber = {
  display: 'inline-block',
  backgroundColor: '#40C0C0',
  color: '#ffffff',
  width: '24px',
  height: '24px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  borderRadius: '50%',
  fontSize: '12px',
  fontWeight: 'bold',
  marginRight: '12px',
};

const stepText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
  display: 'inline-block',
  verticalAlign: 'middle' as const,
};

const upgradeContainer = {
  backgroundColor: '#FEF3C7',
  border: '1px solid #FCD34D',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const upgradeTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400E',
  margin: '0 0 8px 0',
};

const upgradeText = {
  fontSize: '14px',
  color: '#78350F',
  margin: '0 0 16px 0',
  lineHeight: '20px',
};

const upgradeButton = {
  backgroundColor: '#F59E0B',
  color: '#ffffff',
  padding: '12px 28px',
  fontSize: '14px',
  fontWeight: 'bold',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
};

const faqQuestion = {
  fontSize: '14px',
  color: '#1A3E4C',
  margin: '12px 0 4px 0',
};

const faqAnswer = {
  fontSize: '13px',
  color: '#6B7280',
  margin: '0 0 12px 0',
  lineHeight: '18px',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#6B7280',
  margin: '0 0 12px 0',
};

const footerLinks = {
  margin: '12px 0',
  textAlign: 'center' as const,
};

const footerLink = {
  display: 'inline',
  margin: '0 4px',
  fontSize: '12px',
};

const link = {
  color: '#40C0C0',
  textDecoration: 'underline',
};

const copyright = {
  fontSize: '11px',
  color: '#9CA3AF',
  margin: '12px 0 0 0',
};
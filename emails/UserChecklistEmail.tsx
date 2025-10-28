import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Row,
} from '@react-email/components';

interface UserChecklistEmailProps {
  checklistName: string;
  downloadUrl: string;
}

export default function UserChecklistEmail({
  checklistName,
  downloadUrl,
}: UserChecklistEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Je checklist "{checklistName}" staat voor je klaar!</Preview>
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
              Bedankt voor je interesse! Hier is de downloadlink voor de checklist die je hebt aangevraagd: <strong>{checklistName}</strong>.
            </Text>

            {/* Download Button */}
            <Section style={buttonContainer}>
              <Button style={downloadButton} href={downloadUrl}>
                📥 Download je Checklist
              </Button>
            </Section>
            
            <Text style={body}>
              We hopen dat deze checklist je helpt om dure fouten te voorkomen en met zekerheid aan je (ver)bouwproject te beginnen.
            </Text>

            <Text style={body}>
              Met vriendelijke groet,
              <br />
              Het team van Brikx
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              Je ontvangt deze e-mail omdat je een checklist hebt aangevraagd op brikx.nl.
            </Text>
             <Row style={footerLinks}>
               <Text style={footerLink}><Link href="https://brikx.nl" style={link}>Website</Link></Text>
               <Text style={footerLink}> • </Text>
               <Text style={footerLink}><Link href="https://brikx.nl/contact" style={link}>Contact</Link></Text>
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

// --- Styles (grotendeels overgenomen en vereenvoudigd) ---
const main = { backgroundColor: '#f5f7f9', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0', marginBottom: '20px' };
const header = { backgroundColor: '#1A3E4C', color: '#ffffff', padding: '24px', textAlign: 'center' as const };
const headerTitle = { fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' };
const headerSubtitle = { fontSize: '14px', opacity: 0.9, margin: '0' };
const content = { padding: '24px' };
const greeting = { fontSize: '14px', lineHeight: '24px', margin: '0 0 12px 0' };
const body = { fontSize: '16px', lineHeight: '24px', margin: '16px 0', color: '#1A3E4C' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };
const downloadButton = { backgroundColor: '#40C0C0', color: '#ffffff', padding: '12px 32px', fontSize: '16px', fontWeight: 'bold', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' };
const divider = { borderColor: '#E5E7EB', margin: '24px 0' };
const footer = { padding: '24px', textAlign: 'center' as const };
const footerText = { fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0' };
const footerLinks = { margin: '12px 0', textAlign: 'center' as const };
const footerLink = { display: 'inline', margin: '0 4px', fontSize: '12px' };
const link = { color: '#40C0C0', textDecoration: 'underline' };
const copyright = { fontSize: '11px', color: '#9CA3AF', margin: '12px 0 0 0' };
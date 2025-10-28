import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface AdminNotificationEmailProps {
  userEmail: string;
  checklistName: string;
  downloadDate: string;
  ipAddress: string;
  location: string;
}

export default function AdminNotificationEmail({
  userEmail,
  checklistName,
  downloadDate,
  ipAddress,
  location,
}: AdminNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nieuwe download: {checklistName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={title}>📥 Nieuwe Checklist Download</Text>
            
            <Text style={infoItem}>
              <strong>Checklist:</strong> {checklistName}
            </Text>
            <Text style={infoItem}>
              <strong>E-mailadres:</strong> {userEmail}
            </Text>
            <Text style={infoItem}>
              <strong>Datum:</strong> {downloadDate}
            </Text>
            <Text style={infoItem}>
              <strong>IP-adres:</strong> {ipAddress}
            </Text>
            <Text style={infoItem}>
              <strong>Locatie (schatting):</strong> {location}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// --- Styles ---
const main = { backgroundColor: '#f5f7f9', fontFamily: 'sans-serif' };
const container = { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', margin: '20px auto', padding: '20px', width: '480px' };
const content = { padding: '12px' };
const title = { fontSize: '20px', fontWeight: 'bold', color: '#1A3E4C', marginBottom: '20px' };
const infoItem = { fontSize: '14px', color: '#374151', margin: '8px 0', lineHeight: '20px' };
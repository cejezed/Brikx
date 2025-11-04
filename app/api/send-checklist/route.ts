import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import UserChecklistEmail from '@/emails/UserChecklistEmail';
import AdminNotificationEmail from '@/emails/AdminNotificationEmail';

// Initialiseer Resend met je API sleutel uit .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

// Haal je eigen e-mailadres op voor notificaties
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Dit is je "database" met checklists. 
// De naam hier moet exact overeenkomen met wat je in de 'onClick' functie meegeeft.
const checklistsDb = {
  'Financiële Routekaart': {
    subject: '📄 Jouw Financiële Routekaart voor je Droomhuis',
    downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/downloads/Brikx-Checklist-Financien.pdf`,
  },
  'Kennisbank Stappenplan': {
    subject: '🗺️ Jouw Stappenplan voor een Succesvol Bouwproject',
    downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/downloads/Brikx-Checklist-Stappenplan.pdf`,
  },
  'Algemene Bouw Checklist': {
    subject: '🛠️ Jouw Algemene Bouw Checklist',
    downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/downloads/Brikx-Checklist-Algemeen.pdf`,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { email, checklistName } = await request.json();

    // Validatie van de input
    if (!email || !checklistName) {
      return NextResponse.json({ error: 'E-mail en checklistnaam zijn verplicht' }, { status: 400 });
    }

    // @ts-ignore - Dit is nodig omdat TypeScript de dynamische key niet kent
    const checklist = checklistsDb[checklistName];

    // Controleer of de gevraagde checklist bestaat in onze 'database'
    if (!checklist) {
      return NextResponse.json({ error: 'Checklist niet gevonden' }, { status: 404 });
    }

    // STAP 1: Stuur de e-mail naar de gebruiker
    await resend.emails.send({
      from: `Brikx <${fromEmail}>`, // Gebruik het geverifieerde from adres uit .env
      to: email,
      subject: checklist.subject,
      react: UserChecklistEmail({
        checklistName: checklistName,
        downloadUrl: checklist.downloadUrl,
      }),
    });

    // STAP 2: Stuur de notificatie-e-mail naar jezelf (admin)
    if (adminEmail) {
      // Haal locatiegegevens uit headers (werkt op Vercel/Netlify)
      const ip = 
        request.headers.get('x-forwarded-for')?.split(',')[0] || 
        request.headers.get('x-real-ip') || 
        'Onbekend';
      
      const city = request.headers.get('x-vercel-ip-city') || 'Onbekende stad';
      const country = request.headers.get('x-vercel-ip-country') || 'Onbekend land';

      await resend.emails.send({
        from: `Brikx Notificatie <${fromEmail}>`, // Gebruik hetzelfde geverifieerde adres
        to: adminEmail,
        subject: `📥 Nieuwe download: ${checklistName}`,
        react: AdminNotificationEmail({
          userEmail: email,
          checklistName: checklistName,
          downloadDate: new Date().toLocaleString('nl-NL'),
          ipAddress: ip,
          location: `${city}, ${country}`,
        }),
      });
    }

    // Stuur een succesvol antwoord terug naar de frontend
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[send-checklist-api] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
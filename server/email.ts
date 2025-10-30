import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable is required");
}

if (!process.env.SENDGRID_FROM_EMAIL) {
  throw new Error("SENDGRID_FROM_EMAIL environment variable is required");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

export interface WelcomeEmailData {
  email: string;
  firstName: string;
  lastName: string;
}

export interface VoucherEmailData {
  email: string;
  firstName: string;
  lastName: string;
  bookingId: string;
  bookingType: 'transfer' | 'disposal' | 'tour';
  bookingDetails: {
    date: string;
    time?: string;
    origin?: string;
    destination?: string;
    tourName?: string;
    vehicleName?: string;
    passengers: number;
    totalPrice: number;
  };
}

export interface MissionOrderEmailData {
  providerEmail: string;
  providerName: string;
  bookingId: string;
  bookingType: 'transfer' | 'disposal';
  customerName: string;
  bookingDetails: {
    date: string;
    time: string;
    origin?: string;
    destination?: string;
    passengers: number;
    luggage?: number;
    vehicleName: string;
    specialRequests?: string;
    flightNumber?: string;
    nameOnPlacard?: string;
  };
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  try {
    const msg = {
      to: data.email,
      from: FROM_EMAIL,
      subject: 'Bienvenue sur NavetteClub 🚗',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #0066CC; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            h1 { margin: 0; font-size: 28px; }
            .highlight { background: #f0f7ff; padding: 15px; border-left: 4px solid #0066CC; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur NavetteClub</h1>
            </div>
            <div class="content">
              <p>Bonjour ${data.firstName} ${data.lastName},</p>
              
              <p>Nous sommes ravis de vous accueillir sur <strong>NavetteClub</strong>, votre plateforme de réservation de transport premium en Tunisie.</p>
              
              <div class="highlight">
                <strong>Avec NavetteClub, profitez de :</strong>
                <ul>
                  <li>🚗 Transferts aéroport et ville-à-ville</li>
                  <li>🌍 City tours personnalisés</li>
                  <li>⏰ Mise à disposition avec chauffeur</li>
                  <li>💳 Paiement sécurisé en ligne</li>
                  <li>📱 Suivi de vos réservations en temps réel</li>
                </ul>
              </div>
              
              <p>Votre compte est maintenant actif et vous pouvez commencer à réserver dès maintenant.</p>
              
              <p style="text-align: center;">
                <a href="${process.env.NODE_ENV === 'production' ? 'https://' : 'http://'}${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}" class="button">
                  Commencer à réserver
                </a>
              </p>
              
              <p>Si vous avez des questions, notre équipe est à votre disposition.</p>
              
              <p>Cordialement,<br>L'équipe NavetteClub</p>
            </div>
            <div class="footer">
              <p>NavetteClub - Transport Premium en Tunisie</p>
              <p>Cet email a été envoyé à ${data.email}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
    console.log('Welcome email sent to:', data.email);
  } catch (error: any) {
    console.error('SendGrid welcome email error:', error.response?.body || error.message);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
}

/**
 * Send booking voucher to customer after successful payment
 */
export async function sendVoucherEmail(data: VoucherEmailData): Promise<void> {
  try {
    let bookingTypeLabel = '';
    let detailsHtml = '';

    switch (data.bookingType) {
      case 'transfer':
        bookingTypeLabel = 'Transfert';
        detailsHtml = `
          <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>De :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.origin}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>À :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.destination}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Véhicule :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.vehicleName}</td></tr>
        `;
        break;
      case 'disposal':
        bookingTypeLabel = 'Mise à disposition';
        detailsHtml = `
          <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Lieu :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.origin}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Véhicule :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.vehicleName}</td></tr>
        `;
        break;
      case 'tour':
        bookingTypeLabel = 'City Tour';
        detailsHtml = `
          <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Tour :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.tourName}</td></tr>
        `;
        break;
    }

    const msg = {
      to: data.email,
      from: FROM_EMAIL,
      subject: `Confirmation de votre réservation #${data.bookingId.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
            .voucher { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .booking-details { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .booking-details td { padding: 8px; border-bottom: 1px solid #e0e0e0; }
            .total { background: #f0f7ff; padding: 15px; border-radius: 6px; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; }
            h1 { margin: 0; font-size: 28px; }
            .check-icon { font-size: 48px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="check-icon">✓</div>
              <h1>Paiement confirmé</h1>
            </div>
            <div class="content">
              <p>Bonjour ${data.firstName} ${data.lastName},</p>
              
              <p>Nous avons bien reçu votre paiement. Votre réservation est confirmée !</p>
              
              <div class="voucher">
                <h2 style="margin-top: 0; color: #059669;">Voucher de réservation</h2>
                <p><strong>Type :</strong> ${bookingTypeLabel}</p>
                <p><strong>Numéro de réservation :</strong> #${data.bookingId.slice(0, 8).toUpperCase()}</p>
                
                <table class="booking-details">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Date :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.date}</td></tr>
                  ${data.bookingDetails.time ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Heure :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.time}</td></tr>` : ''}
                  ${detailsHtml}
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Passagers :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.passengers}</td></tr>
                </table>
                
                <div class="total">
                  Total payé : ${data.bookingDetails.totalPrice.toFixed(2)} TND
                </div>
              </div>
              
              <p><strong>Prochaines étapes :</strong></p>
              <ul>
                <li>Conservez cet email comme preuve de réservation</li>
                <li>Un transporteur vous contactera prochainement</li>
                <li>Vous pouvez suivre votre réservation depuis votre espace client</li>
              </ul>
              
              <p>Merci de votre confiance !</p>
              
              <p>Cordialement,<br>L'équipe NavetteClub</p>
            </div>
            <div class="footer">
              <p>NavetteClub - Transport Premium en Tunisie</p>
              <p>Numéro de réservation : #${data.bookingId.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
    console.log('Voucher email sent to:', data.email);
  } catch (error: any) {
    console.error('SendGrid voucher email error:', error.response?.body || error.message);
    throw new Error(`Failed to send voucher email: ${error.message}`);
  }
}

/**
 * Send mission order to provider/transporter
 */
export async function sendMissionOrderEmail(data: MissionOrderEmailData): Promise<void> {
  try {
    let detailsHtml = '';

    if (data.bookingType === 'transfer') {
      detailsHtml = `
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Départ :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.origin}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Destination :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.destination}</td></tr>
        ${data.bookingDetails.flightNumber ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>N° de vol :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.flightNumber}</td></tr>` : ''}
        ${data.bookingDetails.nameOnPlacard ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Nom sur pancarte :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.nameOnPlacard}</td></tr>` : ''}
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Bagages :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.luggage || 0}</td></tr>
      `;
    } else {
      detailsHtml = `
        <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Lieu de prise en charge :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.origin}</td></tr>
      `;
    }

    const msg = {
      to: data.providerEmail,
      from: FROM_EMAIL,
      subject: `Nouvel ordre de mission #${data.bookingId.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
            .mission-box { background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .booking-details { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .booking-details td { padding: 8px; border-bottom: 1px solid #e0e0e0; }
            .alert { background: #fef3c7; padding: 12px; border-left: 4px solid #f59e0b; margin: 15px 0; }
            h1 { margin: 0; font-size: 28px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ordre de Mission</h1>
            </div>
            <div class="content">
              <p>Bonjour ${data.providerName},</p>
              
              <p>Vous avez reçu un nouvel ordre de mission de la part de NavetteClub.</p>
              
              <div class="mission-box">
                <h2 style="margin-top: 0; color: #d97706;">Détails de la mission</h2>
                <p><strong>Numéro de mission :</strong> #${data.bookingId.slice(0, 8).toUpperCase()}</p>
                <p><strong>Type :</strong> ${data.bookingType === 'transfer' ? 'Transfert' : 'Mise à disposition'}</p>
                
                <table class="booking-details">
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Client :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.customerName}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Date :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.date}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Heure :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.time}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Véhicule :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.vehicleName}</td></tr>
                  ${detailsHtml}
                  <tr><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Passagers :</strong></td><td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${data.bookingDetails.passengers}</td></tr>
                </table>
                
                ${data.bookingDetails.specialRequests ? `
                  <div class="alert">
                    <strong>Demandes spéciales :</strong><br>
                    ${data.bookingDetails.specialRequests}
                  </div>
                ` : ''}
              </div>
              
              <p><strong>Actions requises :</strong></p>
              <ul>
                <li>Confirmez la disponibilité du véhicule et du chauffeur</li>
                <li>Préparez le véhicule selon les normes NavetteClub</li>
                <li>Respectez l'horaire de prise en charge</li>
                <li>Contactez le client si nécessaire</li>
              </ul>
              
              <p>Connectez-vous à votre espace transporteur pour plus de détails.</p>
              
              <p>Cordialement,<br>L'équipe NavetteClub</p>
            </div>
            <div class="footer">
              <p>NavetteClub - Plateforme de gestion de transport</p>
              <p>Mission #${data.bookingId.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await sgMail.send(msg);
    console.log('Mission order email sent to:', data.providerEmail);
  } catch (error: any) {
    console.error('SendGrid mission order email error:', error.response?.body || error.message);
    throw new Error(`Failed to send mission order email: ${error.message}`);
  }
}

import { MatchType } from "@prisma/client";
import nodemailer from "nodemailer";

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface MatchNotificationData {
  matchType: MatchType;
  submitterName: string;
  submitterEmail: string;
  winner1Name: string;
  winner2Name?: string;
  loser1Name: string;
  loser2Name?: string;
  winnerScore: number;
  loserScore: number;
}

export async function sendMatchSubmissionNotification(
  data: MatchNotificationData,
  recipientEmails: string[],
) {
  const {
    matchType,
    submitterName,
    winner1Name,
    winner2Name,
    loser1Name,
    loser2Name,
    winnerScore,
    loserScore,
  } = data;

  // Build match description
  let matchDescription: string;
  if (matchType === MatchType.SINGLES) {
    matchDescription = `${winner1Name} vs ${loser1Name}`;
  } else {
    matchDescription = `${winner1Name} & ${winner2Name} vs ${loser1Name} & ${loser2Name}`;
  }

  const subject = `🏓 Match Result Pending Confirmation: ${matchDescription}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            background: #fafafa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .match-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
          }
          .match-info h2 {
            margin-top: 0;
            color: #18181b;
            font-size: 18px;
          }
          .score {
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            color: #00ffa5;
          }
          .team {
            margin: 15px 0;
            padding: 10px;
            background: #f9fafb;
            border-radius: 6px;
          }
          .team-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 5px;
          }
          .team-names {
            font-size: 16px;
            color: #18181b;
            font-weight: 500;
          }
          .button {
            display: inline-block;
            background: #00ffa5;
            color: #18181b;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
          }
          .button:hover {
            background: #00e094;
          }
          .button-secondary {
            background: #f3f4f6;
            color: #18181b;
          }
          .button-secondary:hover {
            background: #e5e7eb;
          }
          .cta {
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          .note {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏓 Table Tennis Match Submitted</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p><strong>${submitterName}</strong> has submitted a match result that needs your confirmation.</p>
          
          <div class="match-info">
            <h2>${matchType === "SINGLES" ? "Singles Match (1v1)" : "Doubles Match (2v2)"}</h2>
            
            <div class="team">
              <div class="team-label">Winners</div>
              <div class="team-names">${matchType === "SINGLES" ? winner1Name : `${winner1Name} & ${winner2Name}`}</div>
            </div>
            
            <div class="score">${winnerScore} - ${loserScore}</div>
            
            <div class="team">
              <div class="team-label">Losers</div>
              <div class="team-names">${matchType === "SINGLES" ? loser1Name : `${loser1Name} & ${loser2Name}`}</div>
            </div>
          </div>

          <div class="note">
            <strong>⏰ Action Required:</strong> Please confirm or dispute this result within 48 hours. If not responded, it will be automatically confirmed.
          </div>

          <div class="cta">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://tt-ranker.strativ.se"}/dashboard" class="button">
              View Match & Confirm
            </a>
          </div>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            You can confirm or dispute this match from your dashboard. If you believe the results are incorrect, 
            click "Dispute" and we'll review it.
          </p>
        </div>
        <div class="footer">
          <p>TopSpin</p>
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Table Tennis Match Submitted

${submitterName} has submitted a match result that needs your confirmation.

Match Type: ${matchType === "SINGLES" ? "Singles (1v1)" : "Doubles (2v2)"}

Winners: ${matchType === "SINGLES" ? winner1Name : `${winner1Name} & ${winner2Name}`}
Score: ${winnerScore} - ${loserScore}
Losers: ${matchType === "SINGLES" ? loser1Name : `${loser1Name} & ${loser2Name}`}

⏰ Action Required: Please confirm or dispute this result within 48 hours. If not responded, it will be automatically confirmed.

View and respond to this match at: ${process.env.NEXT_PUBLIC_APP_URL || "https://tt-ranker.strativ.se"}/dashboard

---
TopSpin Table Tennis Ranker
This is an automated notification. Please do not reply to this email.
  `;

  try {
    // Filter out the submitter's email from recipients
    const uniqueRecipients = [...new Set(recipientEmails)];

    // Send email using Nodemailer
    const info = await transporter.sendMail({
      from: `"TopSpin" <${process.env.SMTP_USER}>`,
      to: uniqueRecipients.join(", "),
      subject,
      html: htmlContent,
      text: textContent,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

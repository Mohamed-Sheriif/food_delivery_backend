export function memberInvitationEmailTemplate(
  otp: string,
  role: string,
): {
  subject: string;
  html: string;
} {
  return {
    subject: "You're Invited to Join Our Restaurant Team",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:40px 20px;">
          <tr>
            <td align="center">
              <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                style="
                  background:#ffffff;
                  border-radius:12px;
                  overflow:hidden;
                  box-shadow:0 2px 10px rgba(0,0,0,0.08);
                "
              >
                <!-- Header -->
                <tr>
                  <td
                    align="center"
                    style="
                      background:#16a34a;
                      color:#ffffff;
                      padding:32px 24px;
                    "
                  >
                    <h1 style="margin:0;font-size:28px;">
                      🎉 Team Invitation
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:40px 32px;">
                    <h2 style="margin-top:0;color:#1f2937;">
                      You've Been Invited!
                    </h2>

                    <p style="color:#4b5563;font-size:16px;line-height:1.6;">
                      A restaurant owner has invited you to join their team.
                    </p>

                    <div
                      style="
                        background:#f9fafb;
                        border-left:4px solid #16a34a;
                        padding:16px;
                        margin:24px 0;
                        border-radius:8px;
                      "
                    >
                      <p style="margin:0;color:#374151;font-size:15px;">
                        <strong>Assigned Role:</strong> ${role}
                      </p>
                    </div>

                    <p style="color:#4b5563;font-size:16px;line-height:1.6;">
                      To accept the invitation, use the verification code below:
                    </p>

                    <div style="text-align:center;margin:32px 0;">
                      <div
                        style="
                          display:inline-block;
                          background:#ecfdf5;
                          border:2px dashed #16a34a;
                          border-radius:12px;
                          padding:18px 32px;
                          font-size:32px;
                          font-weight:bold;
                          letter-spacing:8px;
                          color:#16a34a;
                        "
                      >
                        ${otp}
                      </div>
                    </div>

                    <p style="color:#4b5563;font-size:16px;line-height:1.6;">
                      Enter this code in the application to complete your
                      registration and gain access to your restaurant workspace.
                    </p>

                    <p style="color:#4b5563;font-size:16px;line-height:1.6;">
                      If you were not expecting this invitation, you can safely
                      ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    style="
                      background:#f9fafb;
                      padding:24px;
                      text-align:center;
                      color:#6b7280;
                      font-size:14px;
                    "
                  >
                    Welcome aboard! We look forward to having you on the team.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
}

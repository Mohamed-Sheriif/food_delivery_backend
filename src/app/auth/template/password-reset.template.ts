export function passwordResetEmailTemplate(otp: string): {
  subject: string;
  html: string;
} {
  return {
    subject: "Reset Your Password",
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
                      background:#2563eb;
                      padding:32px 24px;
                      color:#ffffff;
                    "
                  >
                    <h1 style="margin:0;font-size:28px;">
                      Password Reset
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:40px 32px;">
                    <h2
                      style="
                        margin-top:0;
                        color:#1f2937;
                        font-size:22px;
                      "
                    >
                      Forgot your password?
                    </h2>

                    <p
                      style="
                        color:#4b5563;
                        font-size:16px;
                        line-height:1.6;
                      "
                    >
                      We received a request to reset your password.
                      Use the verification code below to continue.
                    </p>

                    <!-- OTP -->
                    <div
                      style="
                        text-align:center;
                        margin:32px 0;
                      "
                    >
                      <div
                        style="
                          display:inline-block;
                          background:#eff6ff;
                          border:2px dashed #2563eb;
                          border-radius:12px;
                          padding:18px 32px;
                          font-size:32px;
                          font-weight:bold;
                          letter-spacing:8px;
                          color:#2563eb;
                        "
                      >
                        ${otp}
                      </div>
                    </div>

                    <p
                      style="
                        color:#4b5563;
                        font-size:16px;
                        line-height:1.6;
                      "
                    >
                      This code will expire in <strong>10 minutes</strong>.
                    </p>

                    <p
                      style="
                        color:#4b5563;
                        font-size:16px;
                        line-height:1.6;
                      "
                    >
                      If you didn't request a password reset, you can safely
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
                    © ${new Date().getFullYear()} Your App.
                    All rights reserved.
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

export const emailTemplate = (otp) => {
    return `

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Message</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0a0572; padding:20px; text-align:center; color:white;">
              <h2 style="margin:0;"> Saraha App</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333;">
              <p style="font-size:16px;">Hey <strong>{{username}}</strong>,</p>

              <p style="font-size:15px;">
                You’ve received a new anonymous message on your Saraha app
              </p>

              <!-- Message Box -->
              <div style="background:#f9f9f9; padding:20px; border-radius:8px; border-left:5px solid #6c63ff; margin:20px 0;">
                <p style="margin:0; font-size:15px; color:#555;">
                  code : ${otp}
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center; margin-top:30px;">
                <a href="{{app_link}}" 
                   style="background:#6c63ff; color:white; text-decoration:none; padding:12px 25px; border-radius:5px; font-size:15px;">
                   View Message
                </a>
              </div>

              <p style="margin-top:30px; font-size:13px; color:#888;">
                Stay curious  <br>
                — Saraha Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#999;">
              © 2026 Saraha App. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`}
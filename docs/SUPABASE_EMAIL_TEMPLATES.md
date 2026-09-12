# Anjori Arts - Supabase Auth Email Templates

This guide provides ready-to-copy HTML templates for Supabase Authentication emails. These templates are styled with the signature **Anjori Arts** brand palette, typography, and warm artisanal tone.

---

## 1. Quick Setup in Supabase Dashboard

### Step 1: Enable Custom SMTP (Resend)
By default, Supabase sends from `noreply@mail.app.supabase.io` (with strict 3-30 email/hour rate limits). Route through Resend instead:

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Navigate to **Project Settings** (gear icon) ➔ **Authentication** ➔ scroll to **SMTP Settings**.
3. Toggle **Enable Custom SMTP** to **ON**:
   - **Sender Email**: `noreply@anjoriarts.com` *(or `hello@anjoriarts.com`)*
   - **Sender Name**: `Anjori Arts`
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) or `587` (TLS)
   - **Username**: `resend`
   - **Password**: `<your_resend_api_key>`
4. Click **Save Changes**.

---

### Step 2: Configure Email Templates
Navigate to **Authentication** ➔ **Email Templates** in your Supabase project. For each tab below, paste the corresponding HTML into the **Message Body** and update the **Subject**.

---

## 2. Brand Tokens & Design System

| Token | Site Variable | Hex Code | Email Role |
| :--- | :--- | :--- | :--- |
| **Parchment Background** | `--background` | `#faf7f0` | Outer background |
| **Ivory Canvas Card** | `--card` | `#fffdf8` | Email container card |
| **Botanical Sage** | `--art-stem` | `#355f5d` | Header banner background |
| **Sage Teal (Primary)** | `--primary` | `#5f9795` | Call to action button |
| **Turmeric Sun (Accent)**| `--aa-hero-sun`| `#ecc16b` | Top accent bar & highlights |
| **Soft Sage Mist** | `--secondary` | `#e7efeb` | Code highlight block |
| **Charcoal Ink** | `--foreground` | `#2b2926` | Headings & primary copy |
| **Earthy Charcoal** | `--muted-foreground` | `#69655d` | Supporting text |
| **Handmade Border** | `--border` | `#e4ded1` | Dividers & container borders |

* **Headings:** `'Playfair Display', Georgia, serif`
* **Body:** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

---

## 3. Email Templates

### 3.1 Confirm Signup (Verification Email)

* **Supabase Tab:** `Confirm signup`
* **Subject:** `Welcome to Anjori Arts — Confirm your email 🎨`
* **HTML Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Anjori Arts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin:0; padding:0; background-color:#faf7f0; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#2b2926; line-height:1.65; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#faf7f0; padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px; background-color:#fffdf8; border-radius:14px; overflow:hidden; border:1px solid #e4ded1; box-shadow:0 10px 25px -5px rgba(43,41,38,0.06);">
          
          <!-- Sun Gold Accent Stripe -->
          <tr>
            <td style="background-color:#ecc16b; height:5px; font-size:1px; line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color:#355f5d; padding:36px 28px 30px 28px; text-align:center; color:#ffffff;">
              <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#ecc16b; font-weight:600;">
                Traditional Art &amp; Bespoke Design
              </p>
              <h1 style="margin:0; font-family:'Playfair Display', Georgia, serif; font-size:28px; font-weight:600; letter-spacing:0.5px; color:#ffffff;">
                Anjori Arts
              </h1>
              <p style="margin:8px 0 0 0; font-size:13px; color:#e7efeb; font-style:italic;">
                &ldquo;Art that carries a little more meaning.&rdquo;
              </p>
            </td>
          </tr>

          <!-- Main Letter Body -->
          <tr>
            <td style="padding:40px 36px 28px 36px;">
              <h2 style="margin:0 0 16px 0; font-family:'Playfair Display', Georgia, serif; font-size:22px; font-weight:600; color:#2b2926; line-height:1.3;">
                Welcome to our creative circle 🎨
              </h2>
              
              <p style="margin:0 0 16px 0; font-size:15px; color:#4a463f;">
                Hello{{ if .Data }}{{ if index .Data "first_name" }} {{ index .Data "first_name" }}{{ end }}{{ end }},
              </p>

              <p style="margin:0 0 16px 0; font-size:15px; color:#4a463f;">
                Thank you for joining Anjori Arts. Every painting, keepsake, and custom piece in our studio is created slowly by hand—honoring traditional Indian art forms like Madhubani, Tanjore, and Warli while crafting something truly personal for your home.
              </p>

              <p style="margin:0 0 28px 0; font-size:15px; color:#4a463f;">
                To confirm your email and activate your collector account, please click the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 30px auto;">
                <tr>
                  <td align="center" style="border-radius:10px; background-color:#5f9795; box-shadow:0 4px 12px rgba(95,151,149,0.28);">
                    <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:15px 36px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px; letter-spacing:0.02em;">
                      Confirm My Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Code Box (If OTP enabled) -->
              {{ if .Token }}
              <div style="background-color:#e7efeb; border:1px solid #c8dbd4; border-radius:10px; padding:18px 20px; text-align:center; margin-bottom:28px;">
                <p style="margin:0 0 6px 0; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#355f5d;">
                  Or enter this 6-digit verification code:
                </p>
                <div style="font-family:monospace; font-size:26px; font-weight:700; letter-spacing:6px; color:#2b2926;">
                  {{ .Token }}
                </div>
              </div>
              {{ end }}

              <!-- Fallback Link -->
              <div style="background-color:#faf7f0; border-radius:8px; padding:14px 18px; margin-bottom:24px; border:1px solid #e4ded1;">
                <p style="margin:0 0 6px 0; font-size:12px; color:#69655d;">
                  Button not clickable? Copy and paste this link into your browser:
                </p>
                <p style="margin:0; font-size:12px; color:#5f9795; word-break:break-all; line-height:1.4;">
                  {{ .ConfirmationURL }}
                </p>
              </div>

              <!-- Security Notice -->
              <p style="margin:0; font-size:12px; color:#8c887d; font-style:italic;">
                If you did not request this account, you can safely ignore this email. No artwork or profile has been reserved.
              </p>
            </td>
          </tr>

          <!-- Studio Sign-off & Footer -->
          <tr>
            <td style="background-color:#f5f1e8; border-top:1px solid #e4ded1; padding:28px 36px; text-align:center;">
              <p style="margin:0 0 4px 0; font-family:'Playfair Display', Georgia, serif; font-size:16px; font-weight:600; color:#2b2926;">
                Jyotsna Sharma
              </p>
              <p style="margin:0 0 14px 0; font-size:12px; color:#69655d;">
                Artist &amp; Founder &bull; Anjori Arts
              </p>
              <p style="margin:0; font-size:12px; color:#8c887d; line-height:1.6;">
                Studio based in Puducherry, India<br>
                <a href="https://www.anjoriarts.com" style="color:#355f5d; text-decoration:none; font-weight:500;">anjoriarts.com</a> &bull; 
                <a href="mailto:hello@anjoriarts.com" style="color:#355f5d; text-decoration:none;">hello@anjoriarts.com</a> &bull; 
                <a href="https://wa.me/918051960916" style="color:#355f5d; text-decoration:none;">WhatsApp: +91 80519 60916</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 3.2 Reset Password

* **Supabase Tab:** `Reset password`
* **Subject:** `Reset your Anjori Arts password`
* **HTML Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Anjori Arts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin:0; padding:0; background-color:#faf7f0; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#2b2926; line-height:1.65; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#faf7f0; padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px; background-color:#fffdf8; border-radius:14px; overflow:hidden; border:1px solid #e4ded1; box-shadow:0 10px 25px -5px rgba(43,41,38,0.06);">
          
          <!-- Sun Gold Accent Stripe -->
          <tr>
            <td style="background-color:#ecc16b; height:5px; font-size:1px; line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color:#355f5d; padding:32px 28px 26px 28px; text-align:center; color:#ffffff;">
              <h1 style="margin:0; font-family:'Playfair Display', Georgia, serif; font-size:26px; font-weight:600; letter-spacing:0.5px; color:#ffffff;">
                Anjori Arts
              </h1>
              <p style="margin:6px 0 0 0; font-size:12px; color:#e7efeb; text-transform:uppercase; letter-spacing:0.12em;">
                Account Security
              </p>
            </td>
          </tr>

          <!-- Main Letter Body -->
          <tr>
            <td style="padding:40px 36px 28px 36px;">
              <h2 style="margin:0 0 16px 0; font-family:'Playfair Display', Georgia, serif; font-size:21px; font-weight:600; color:#2b2926; line-height:1.3;">
                Password Reset Request
              </h2>

              <p style="margin:0 0 16px 0; font-size:15px; color:#4a463f;">
                We received a request to reset the password for your Anjori Arts account associated with <strong style="color:#2b2926;">{{ .Email }}</strong>.
              </p>

              <p style="margin:0 0 28px 0; font-size:15px; color:#4a463f;">
                Click the button below to choose a secure new password. For your safety, this link is valid for 1 hour:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 30px auto;">
                <tr>
                  <td align="center" style="border-radius:10px; background-color:#5f9795; box-shadow:0 4px 12px rgba(95,151,149,0.28);">
                    <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:15px 36px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px; letter-spacing:0.02em;">
                      Set New Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <div style="background-color:#faf7f0; border-radius:8px; padding:14px 18px; margin-bottom:24px; border:1px solid #e4ded1;">
                <p style="margin:0 0 6px 0; font-size:12px; color:#69655d;">
                  Button not working? Copy and paste this link into your browser:
                </p>
                <p style="margin:0; font-size:12px; color:#5f9795; word-break:break-all; line-height:1.4;">
                  {{ .ConfirmationURL }}
                </p>
              </div>

              <!-- Reassurance / Anti-phishing -->
              <div style="background-color:#fbf4e8; border-left:3px solid #ecc16b; padding:14px 16px; border-radius:4px;">
                <p style="margin:0; font-size:13px; color:#78581e;">
                  <strong>Didn't request this?</strong> You can safely disregard this email. Your current password will remain completely secure and unchanged.
                </p>
              </div>
            </td>
          </tr>

          <!-- Studio Sign-off & Footer -->
          <tr>
            <td style="background-color:#f5f1e8; border-top:1px solid #e4ded1; padding:24px 36px; text-align:center;">
              <p style="margin:0 0 8px 0; font-size:12px; color:#69655d;">
                Anjori Arts Studio &bull; Puducherry, India
              </p>
              <p style="margin:0; font-size:12px; color:#8c887d;">
                Need assistance? Reply directly to this email or reach us at <a href="mailto:hello@anjoriarts.com" style="color:#355f5d; text-decoration:none;">hello@anjoriarts.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 3.3 Magic Link (Passwordless Sign-In)

* **Supabase Tab:** `Magic Link`
* **Subject:** `Your sign-in link for Anjori Arts 🎨`
* **HTML Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to Anjori Arts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin:0; padding:0; background-color:#faf7f0; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#2b2926; line-height:1.65; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#faf7f0; padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px; background-color:#fffdf8; border-radius:14px; overflow:hidden; border:1px solid #e4ded1; box-shadow:0 10px 25px -5px rgba(43,41,38,0.06);">
          
          <!-- Sun Gold Accent Stripe -->
          <tr>
            <td style="background-color:#ecc16b; height:5px; font-size:1px; line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color:#355f5d; padding:32px 28px 26px 28px; text-align:center; color:#ffffff;">
              <h1 style="margin:0; font-family:'Playfair Display', Georgia, serif; font-size:26px; font-weight:600; letter-spacing:0.5px; color:#ffffff;">
                Anjori Arts
              </h1>
              <p style="margin:6px 0 0 0; font-size:12px; color:#e7efeb; text-transform:uppercase; letter-spacing:0.12em;">
                Instant Sign-In
              </p>
            </td>
          </tr>

          <!-- Main Letter Body -->
          <tr>
            <td style="padding:40px 36px 28px 36px;">
              <h2 style="margin:0 0 16px 0; font-family:'Playfair Display', Georgia, serif; font-size:21px; font-weight:600; color:#2b2926; line-height:1.3;">
                Your Studio Access Link
              </h2>

              <p style="margin:0 0 16px 0; font-size:15px; color:#4a463f;">
                Click the button below to securely sign into your Anjori Arts account. No password required:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 30px auto;">
                <tr>
                  <td align="center" style="border-radius:10px; background-color:#5f9795; box-shadow:0 4px 12px rgba(95,151,149,0.28);">
                    <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:15px 36px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px; letter-spacing:0.02em;">
                      Sign In to Anjori Arts &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Code Box (If OTP enabled) -->
              {{ if .Token }}
              <div style="background-color:#e7efeb; border:1px solid #c8dbd4; border-radius:10px; padding:18px 20px; text-align:center; margin-bottom:28px;">
                <p style="margin:0 0 6px 0; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#355f5d;">
                  Or enter this 6-digit login code:
                </p>
                <div style="font-family:monospace; font-size:26px; font-weight:700; letter-spacing:6px; color:#2b2926;">
                  {{ .Token }}
                </div>
              </div>
              {{ end }}

              <!-- Fallback Link -->
              <div style="background-color:#faf7f0; border-radius:8px; padding:14px 18px; margin-bottom:24px; border:1px solid #e4ded1;">
                <p style="margin:0 0 6px 0; font-size:12px; color:#69655d;">
                  Button not working? Copy and paste this link into your browser:
                </p>
                <p style="margin:0; font-size:12px; color:#5f9795; word-break:break-all; line-height:1.4;">
                  {{ .ConfirmationURL }}
                </p>
              </div>

              <!-- Security Notice -->
              <p style="margin:0; font-size:12px; color:#8c887d; font-style:italic;">
                If you did not request this sign-in link, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Studio Sign-off & Footer -->
          <tr>
            <td style="background-color:#f5f1e8; border-top:1px solid #e4ded1; padding:24px 36px; text-align:center;">
              <p style="margin:0 0 8px 0; font-size:12px; color:#69655d;">
                Anjori Arts Studio &bull; Puducherry, India
              </p>
              <p style="margin:0; font-size:12px; color:#8c887d;">
                Questions? Write to us at <a href="mailto:hello@anjoriarts.com" style="color:#355f5d; text-decoration:none;">hello@anjoriarts.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

### 3.4 Change Email Address

* **Supabase Tab:** `Change Email Address`
* **Subject:** `Confirm your new email address for Anjori Arts`
* **HTML Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change - Anjori Arts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin:0; padding:0; background-color:#faf7f0; font-family:'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#2b2926; line-height:1.65; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#faf7f0; padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px; background-color:#fffdf8; border-radius:14px; overflow:hidden; border:1px solid #e4ded1; box-shadow:0 10px 25px -5px rgba(43,41,38,0.06);">
          
          <!-- Sun Gold Accent Stripe -->
          <tr>
            <td style="background-color:#ecc16b; height:5px; font-size:1px; line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background-color:#355f5d; padding:32px 28px 26px 28px; text-align:center; color:#ffffff;">
              <h1 style="margin:0; font-family:'Playfair Display', Georgia, serif; font-size:26px; font-weight:600; letter-spacing:0.5px; color:#ffffff;">
                Anjori Arts
              </h1>
              <p style="margin:6px 0 0 0; font-size:12px; color:#e7efeb; text-transform:uppercase; letter-spacing:0.12em;">
                Account Preferences
              </p>
            </td>
          </tr>

          <!-- Main Letter Body -->
          <tr>
            <td style="padding:40px 36px 28px 36px;">
              <h2 style="margin:0 0 16px 0; font-family:'Playfair Display', Georgia, serif; font-size:21px; font-weight:600; color:#2b2926; line-height:1.3;">
                Confirm Email Change
              </h2>

              <p style="margin:0 0 16px 0; font-size:15px; color:#4a463f;">
                We received a request to update the email address linked to your Anjori Arts account to this address.
              </p>

              <p style="margin:0 0 28px 0; font-size:15px; color:#4a463f;">
                Click below to confirm this change:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 30px auto;">
                <tr>
                  <td align="center" style="border-radius:10px; background-color:#5f9795; box-shadow:0 4px 12px rgba(95,151,149,0.28);">
                    <a href="{{ .ConfirmationURL }}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:15px 36px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px; letter-spacing:0.02em;">
                      Confirm Email Change &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <div style="background-color:#faf7f0; border-radius:8px; padding:14px 18px; margin-bottom:24px; border:1px solid #e4ded1;">
                <p style="margin:0 0 6px 0; font-size:12px; color:#69655d;">
                  Button not working? Copy and paste this link into your browser:
                </p>
                <p style="margin:0; font-size:12px; color:#5f9795; word-break:break-all; line-height:1.4;">
                  {{ .ConfirmationURL }}
                </p>
              </div>

              <!-- Security Warning -->
              <div style="background-color:#fef2f2; border-left:3px solid #ef4444; padding:12px 16px; border-radius:4px;">
                <p style="margin:0; font-size:13px; color:#991b1b;">
                  <strong>Didn't make this request?</strong> If you did not request to change your email address, please contact us immediately at <a href="mailto:support@anjoriarts.com" style="color:#991b1b; font-weight:bold;">support@anjoriarts.com</a>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Studio Sign-off & Footer -->
          <tr>
            <td style="background-color:#f5f1e8; border-top:1px solid #e4ded1; padding:24px 36px; text-align:center;">
              <p style="margin:0 0 8px 0; font-size:12px; color:#69655d;">
                Anjori Arts Studio &bull; Puducherry, India
              </p>
              <p style="margin:0; font-size:12px; color:#8c887d;">
                Assistance: <a href="mailto:hello@anjoriarts.com" style="color:#355f5d; text-decoration:none;">hello@anjoriarts.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```


export function signupEmailHtml(email: string, logoUrl: string): string {
  const escaped = email
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#E9E9E6;font-family:Arial,Helvetica,sans-serif;color:#111111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E9E9E6">
<tr><td align="center" style="padding:32px 20px 48px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF">
<tr><td style="padding:28px 36px 22px;border-bottom:4px double #111111">
<img src="${logoUrl}" alt="Fortune Creative" width="170" style="display:block;width:170px;height:auto">
</td></tr>
<tr><td style="padding:32px 36px 36px">
<p style="margin:0 0 18px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5D7AA5">Release distribution list</p>
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:32px;line-height:1.15">New Signup</h1>
<p style="margin:0 0 18px;font-size:16px;line-height:1.55">Someone wants to receive Fortune Creative press releases. Add this address to your distribution list:</p>
<div style="padding:18px 20px;border:1px solid #111111;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;word-break:break-all">${escaped}</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function signupEmailText(email: string): string {
  return `FORTUNE CREATIVE
Release distribution list

New Signup

Someone wants to receive Fortune Creative press releases. Add this address to your distribution list:

${email}`;
}

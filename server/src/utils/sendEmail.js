const nodemailer = require('nodemailer');
const { isProd, smtp, emailFrom } = require('../config/env');

let transporter;

const getTransporter = () => {
  if (!smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, text }) => {
  const mailer = getTransporter();
  if (!mailer) {
    // Never print email bodies (which contain reset links) in production logs.
    console.log(
      isProd
        ? `[email] SMTP not configured; skipped "${subject}"`
        : `\n[email:dev] To: ${to}\nSubject: ${subject}\n${text}\n`
    );
    return;
  }
  await mailer.sendMail({ from: emailFrom || smtp.user, to, subject, text });
};

module.exports = sendEmail;
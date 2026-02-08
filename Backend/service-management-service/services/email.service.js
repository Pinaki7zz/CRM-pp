// D:\Galvinus\CRM\CRM-main\Backend-Ser\services\email.service.js

const nodemailer = require('nodemailer');

const createTransporter = () => {
	try {
		return nodemailer.createTransport({
			host: process.env.SMTP_HOST || 'smtp.gmail.com',
			port: process.env.SMTP_PORT || 587,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});
	} catch (error) {
		console.error('Error creating transporter:', error);
		throw new Error('Failed to create email transporter');
	}
};

exports.sendEmail = async ({ to, cc, bcc, subject, body, ticketId, attachments }) => {
	try {
		if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
			throw new Error('SMTP credentials not configured.');
		}

		const transporter = createTransporter();

		try { await transporter.verify(); }
		catch (verifyError) { throw new Error('SMTP connection failed: ' + verifyError.message); }

		const mailOptions = {
			from: process.env.SMTP_FROM || process.env.SMTP_USER,
			to: to,
			cc: cc || undefined,
			bcc: bcc || undefined,
			subject: subject,
			text: body,
			html: body.replace(/\n/g, '<br>'),
			// ✅ Fix: Include attachments in outbound email
			attachments: attachments ? attachments.map(file => ({
				filename: file.filename || file.originalname,
				path: file.path
			})) : []
		};

		const info = await transporter.sendMail(mailOptions);
		console.log(`Email sent successfully: ${info.messageId}`);

		return { messageId: info.messageId, success: true };
	} catch (error) {
		console.error('Email service error:', error);
		throw new Error(error.message || 'Failed to send email');
	}
};
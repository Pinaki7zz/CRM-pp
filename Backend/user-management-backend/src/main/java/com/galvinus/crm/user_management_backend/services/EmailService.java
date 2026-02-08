package com.galvinus.crm.user_management_backend.services;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

	private final JavaMailSender mailSender;

	@Value("${spring.mail.properties.mail.from}")
	private String fromEmail;

	@Value("${app.frontend.url}")
	private String frontendUrl;

	public EmailService(JavaMailSender mailSender) {
		this.mailSender = mailSender;
	}

	public void sendResetPasswordEmail(String toEmail, String token) {
		String resetLink = frontendUrl + "/reset?token=" + token + "&email=" + toEmail;

		String subject = "Password Reset Request";
		String htmlContent = """
				<h2>Reset Your Password</h2>
				<p>You requested a password reset. Click the button below to set a new password:</p>
				<a href="%s" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
					Reset Password
				</a>
				<p>If you did not request this, you can safely ignore this email.</p>
				"""
				.formatted(resetLink);

		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

			helper.setFrom(fromEmail);
			helper.setTo(toEmail);
			helper.setSubject(subject);
			helper.setText(htmlContent, true); // true = HTML

			mailSender.send(message);
			System.out.println("✅ Password reset email sent to: " + toEmail);
		} catch (MessagingException e) {
			throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
		}
	}

	public void sendUsernamePasswordEmail(String to, String name, String username, String tempPassword,
			Instant expiresAt) throws Exception {
		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

		helper.setFrom(System.getenv().getOrDefault("FROM_EMAIL", "no-reply@crm.galvinus.com"));
		helper.setTo(to);
		helper.setSubject("Your account temporary password");

		String expiresText = expiresAt != null ? " (expires: " + expiresAt.toString() + ")" : "";
		String html = "<p>Hello " + escapeHtml(name) + ",</p>"
				+ "<p>An account has been created for you. Sign in with:</p>"
				+ "<p><b>Username:</b> " + escapeHtml(username) + "<br/>"
				+ "<b>Temporary password:</b> <code>" + escapeHtml(tempPassword) + "</code>" + expiresText + "</p>"
				+ "<p>Please change your password at first login.</p>";

		helper.setText(html, true);
		mailSender.send(message);
	}

	// trivial escape; consider Apache Commons Text in real app
	private String escapeHtml(String s) {
		return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
	}
}
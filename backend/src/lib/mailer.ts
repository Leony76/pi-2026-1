import nodemailer from "nodemailer";

import { createHttpError } from "./http-error";

type SmtpConfig = {
	host: string;
	port: number;
	user: string;
	pass: string;
};

function getSmtpConfig(): SmtpConfig {
	const host = process.env.SMTP_HOST;
	const portRaw = process.env.SMTP_PORT;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!host || !portRaw || !user || !pass) {
		throw createHttpError(500, "internal_server_error", "Configurações SMTP não configuradas!");
	}

	const port = Number(portRaw);

	if (!Number.isInteger(port) || port <= 0) {
		throw createHttpError(500, "internal_server_error", "SMTP_PORT inválida!");
	}

	return { host, port, user, pass };
}

function buildPasswordResetCodeHtml(resetCode: string): string {
	return `
		<!doctype html>
		<html lang="pt-BR">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Recuperação de senha</title>
			</head>
			<body style="margin:0;padding:24px;background:#f6f8fb;font-family:Arial,sans-serif;color:#1d293d;">
				<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
					<h1 style="margin:0 0 12px;font-size:20px;">Recuperação de senha</h1>
					<p style="margin:0 0 16px;font-size:14px;line-height:1.5;">Recebemos uma solicitação para redefinir sua senha.</p>
					<p style="margin:0 0 8px;font-size:14px;">Seu código é:</p>
					<p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:4px;color:#0f172a;">${resetCode}</p>
					<p style="margin:0;font-size:13px;line-height:1.5;color:#475569;">Este código expira em 10 minutos. Se você não solicitou essa alteração, ignore este e-mail.</p>
				</div>
			</body>
		</html>
	`;
}

export async function sendPasswordResetCodeEmail(toEmail: string, resetCode: string): Promise<void> {
	const smtp = getSmtpConfig();
	const transporter = nodemailer.createTransport({
		host: smtp.host,
		port: smtp.port,
		secure: smtp.port === 465,
		auth: {
			user: smtp.user,
			pass: smtp.pass,
		},
	});

	await transporter.sendMail({
		from: smtp.user,
		to: toEmail,
		subject: "Código de recuperação de senha",
		text: `Seu código é: ${resetCode}. Este código expira em 10 minutos.`,
		html: buildPasswordResetCodeHtml(resetCode),
	});
}
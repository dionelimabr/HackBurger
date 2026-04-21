import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export const EmailService = {
  async sendOrderConfirmation(to: string, orderData: { id: number; total: number; estimated_at: string }) {
    await transporter.sendMail({
      from: '"HackBurger" <noreply@hackburger.com>',
      to,
      subject: `Pedido #${orderData.id} confirmado!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#C0392B;padding:20px;text-align:center">
            <h1 style="color:#fff;margin:0">HackBurger</h1>
          </div>
          <div style="padding:30px">
            <h2>Seu pedido foi confirmado!</h2>
            <p>Pedido <strong>#${orderData.id}</strong> — Total: <strong>R$ ${orderData.total.toFixed(2)}</strong></p>
            <p>Previsão de entrega: <strong>${new Date(orderData.estimated_at).toLocaleTimeString('pt-BR')}</strong></p>
            <a href="http://localhost:4200/rastreio/${orderData.id}"
               style="display:inline-block;background:#F39C12;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;margin-top:16px">
              Rastrear Pedido
            </a>
          </div>
        </div>
      `,
    });
  },

  async sendWelcome(to: string, name: string) {
    await transporter.sendMail({
      from: '"HackBurger" <noreply@hackburger.com>',
      to,
      subject: `Bem-vindo ao HackBurger, ${name}!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#C0392B;padding:20px;text-align:center">
            <h1 style="color:#fff;margin:0">HackBurger</h1>
          </div>
          <div style="padding:30px">
            <h2>Olá, ${name}!</h2>
            <p>Sua conta foi criada com sucesso. Aproveite os nossos hambúrgueres!</p>
            <a href="http://localhost:4200"
               style="display:inline-block;background:#F39C12;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;margin-top:16px">
              Ver Cardápio
            </a>
          </div>
        </div>
      `,
    });
  },
};

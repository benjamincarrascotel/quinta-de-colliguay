import nodemailer, { Transporter } from 'nodemailer';
import { Reservation } from '@prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';
import { formatBlock } from '../utils/dateHelpers';
import { generateWhatsAppUrl } from '../utils/validationHelpers';
import icsService from './ICSService';

// ============================================
// EMAIL SERVICE
// Envío de notificaciones por email
// ============================================

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth:
        config.email.user && config.email.password
          ? {
              user: config.email.user,
              pass: config.email.password,
            }
          : undefined,
    });
  }

  // ==========================================
  // SOLICITUD CREADA
  // ==========================================

  async sendRequestCreatedToClient(
    reservation: Reservation & { client?: any }
  ): Promise<void> {
    const subject = `Solicitud de Reserva Recibida - Quinta de Colliguay`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Solicitud de Reserva Recibida</h2>

        <p>Hola ${reservation.client?.name},</p>

        <p>Hemos recibido tu solicitud de reserva para Quinta de Colliguay. A continuación los detalles:</p>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles de la Reserva</h3>
          <p><strong>Reserva #:</strong> ${reservation.id}</p>
          <p><strong>Llegada:</strong> ${reservation.arrivalDate.toISOString().split('T')[0]} - ${formatBlock(reservation.arrivalBlock)}</p>
          <p><strong>Salida:</strong> ${reservation.departureDate.toISOString().split('T')[0]} - ${formatBlock(reservation.departureBlock)}</p>
          <p><strong>Personas:</strong> ${reservation.adults} adultos, ${reservation.children} niños</p>
          <p><strong>Monto estimado:</strong> $${reservation.estimatedAmount.toLocaleString('es-CL')} CLP</p>
        </div>

        <p><strong>¿Qué sigue?</strong></p>
        <p>Te contactaremos pronto por WhatsApp para confirmar tu reserva y coordinar el pago del anticipo.</p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Si tienes preguntas, contáctanos por WhatsApp al ${config.admin.whatsapp}
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          Quinta de Colliguay<br/>
          Este es un email automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${config.email.from.name}" <${config.email.from.address}>`,
        to: reservation.client?.email,
        subject,
        html,
      });

      logger.info(`Email sent to client: ${reservation.client?.email}`);
    } catch (error) {
      logger.error('Error sending email to client:', error);
      throw error;
    }
  }

  async sendRequestCreatedToAdmin(
    reservation: Reservation & { client?: any }
  ): Promise<void> {
    const subject = `Nueva Solicitud de Reserva #${reservation.id}`;

    const whatsappUrl = generateWhatsAppUrl(
      reservation.client?.whatsapp,
      `Hola ${reservation.client?.name}, te contacto sobre tu solicitud de reserva #${reservation.id} en Quinta de Colliguay.`
    );

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Nueva Solicitud de Reserva</h2>

        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Reserva #${reservation.id}</h3>
          <p><strong>Cliente:</strong> ${reservation.client?.name}</p>
          <p><strong>Email:</strong> ${reservation.client?.email}</p>
          <p><strong>WhatsApp:</strong> ${reservation.client?.whatsapp}</p>
          <p><strong>Ciudad:</strong> ${reservation.client?.city}</p>
        </div>

        <div style="background-color: #f5f5f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles</h3>
          <p><strong>Llegada:</strong> ${reservation.arrivalDate.toISOString().split('T')[0]} - ${formatBlock(reservation.arrivalBlock)}</p>
          <p><strong>Salida:</strong> ${reservation.departureDate.toISOString().split('T')[0]} - ${formatBlock(reservation.departureBlock)}</p>
          <p><strong>Personas:</strong> ${reservation.adults} adultos, ${reservation.children} niños</p>
          <p><strong>Monto estimado:</strong> $${reservation.estimatedAmount.toLocaleString('es-CL')} CLP</p>
        </div>

        ${
          reservation.clientObservations
            ? `
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Observaciones del Cliente</h3>
            <p>${reservation.clientObservations}</p>
          </div>
        `
            : ''
        }

        <div style="text-align: center; margin: 30px 0;">
          <a href="${whatsappUrl}"
             style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            📱 Contactar por WhatsApp
          </a>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          Quinta de Colliguay - Sistema de Reservas
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${config.email.from.name}" <${config.email.from.address}>`,
        to: config.admin.email,
        subject,
        html,
      });

      logger.info(`Email sent to admin: ${config.admin.email}`);
    } catch (error) {
      logger.error('Error sending email to admin:', error);
      throw error;
    }
  }

  // ==========================================
  // RESERVA CONFIRMADA
  // ==========================================

  async sendConfirmedToClient(reservation: Reservation & { client?: any }): Promise<void> {
    const subject = `Reserva Confirmada #${reservation.id} - Quinta de Colliguay`;

    // Generar archivo .ics
    const icsBuffer = icsService.generateCalendarFile(reservation);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">✅ ¡Reserva Confirmada!</h2>

        <p>Hola ${reservation.client?.name},</p>

        <p>Tu reserva ha sido confirmada. ¡Te esperamos!</p>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles de tu Reserva</h3>
          <p><strong>Reserva #:</strong> ${reservation.id}</p>
          <p><strong>Llegada:</strong> ${reservation.arrivalDate.toISOString().split('T')[0]} - ${formatBlock(reservation.arrivalBlock)}</p>
          <p><strong>Salida:</strong> ${reservation.departureDate.toISOString().split('T')[0]} - ${formatBlock(reservation.departureBlock)}</p>
          <p><strong>Personas:</strong> ${reservation.adults} adultos, ${reservation.children} niños</p>
          ${
            reservation.finalAmount
              ? `<p><strong>Monto total:</strong> $${reservation.finalAmount.toLocaleString('es-CL')} CLP</p>`
              : ''
          }
          ${
            reservation.depositAmount
              ? `<p><strong>Anticipo recibido:</strong> $${reservation.depositAmount.toLocaleString('es-CL')} CLP</p>`
              : ''
          }
        </div>

        <p><strong>📅 Añade a tu calendario</strong></p>
        <p>Hemos adjuntado un archivo de calendario (.ics) que puedes agregar a Google Calendar, Apple Calendar o Outlook.</p>

        <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Políticas importantes:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Cancelación ≥7 días: reembolsable</li>
            <li>Cancelación <7 días: no reembolsable</li>
          </ul>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          ¿Preguntas? Contáctanos por WhatsApp al ${config.admin.whatsapp}
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          Quinta de Colliguay<br/>
          Colliguay, Chile
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${config.email.from.name}" <${config.email.from.address}>`,
        to: reservation.client?.email,
        subject,
        html,
        attachments: [
          {
            filename: `reserva-${reservation.id}.ics`,
            content: icsBuffer,
            contentType: 'text/calendar; charset=utf-8',
          },
        ],
      });

      logger.info(`Confirmation email sent to client: ${reservation.client?.email}`);
    } catch (error) {
      logger.error('Error sending confirmation email to client:', error);
      throw error;
    }
  }

  async sendConfirmedToAdmin(reservation: Reservation & { client?: any }): Promise<void> {
    const subject = `Reserva Confirmada #${reservation.id}`;

    const icsBuffer = icsService.generateCalendarFile(reservation);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Reserva Confirmada</h2>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Reserva #${reservation.id}</h3>
          <p><strong>Cliente:</strong> ${reservation.client?.name}</p>
          <p><strong>Llegada:</strong> ${reservation.arrivalDate.toISOString().split('T')[0]} - ${formatBlock(reservation.arrivalBlock)}</p>
          <p><strong>Salida:</strong> ${reservation.departureDate.toISOString().split('T')[0]} - ${formatBlock(reservation.departureBlock)}</p>
          <p><strong>Personas:</strong> ${reservation.adults} adultos, ${reservation.children} niños</p>
          ${
            reservation.finalAmount
              ? `<p><strong>Monto total:</strong> $${reservation.finalAmount.toLocaleString('es-CL')} CLP</p>`
              : ''
          }
          ${
            reservation.depositAmount
              ? `<p><strong>Anticipo:</strong> $${reservation.depositAmount.toLocaleString('es-CL')} CLP</p>`
              : ''
          }
        </div>

        <p>Archivo de calendario adjunto.</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${config.email.from.name}" <${config.email.from.address}>`,
        to: config.admin.email,
        subject,
        html,
        attachments: [
          {
            filename: `reserva-${reservation.id}.ics`,
            content: icsBuffer,
            contentType: 'text/calendar; charset=utf-8',
          },
        ],
      });

      logger.info(`Confirmation email sent to admin`);
    } catch (error) {
      logger.error('Error sending confirmation email to admin:', error);
    }
  }

  // ==========================================
  // RESERVA CANCELADA
  // ==========================================

  async sendCancelledToClient(reservation: Reservation & { client?: any }): Promise<void> {
    const subject = `Reserva Cancelada #${reservation.id} - Quinta de Colliguay`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Reserva Cancelada</h2>

        <p>Hola ${reservation.client?.name},</p>

        <p>Tu reserva #${reservation.id} ha sido cancelada.</p>

        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reserva #:</strong> ${reservation.id}</p>
          <p><strong>Fechas:</strong> ${reservation.arrivalDate.toISOString().split('T')[0]} - ${reservation.departureDate.toISOString().split('T')[0]}</p>
          ${
            reservation.cancellationReason
              ? `<p><strong>Motivo:</strong> ${reservation.cancellationReason}</p>`
              : ''
          }
        </div>

        <p>Si tienes preguntas, contáctanos por WhatsApp al ${config.admin.whatsapp}</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${config.email.from.name}" <${config.email.from.address}>`,
        to: reservation.client?.email,
        subject,
        html,
      });

      logger.info(`Cancellation email sent to client`);
    } catch (error) {
      logger.error('Error sending cancellation email to client:', error);
    }
  }

  async sendCancelledToAdmin(reservation: Reservation & { client?: any }): Promise<void> {
    const subject = `Reserva Cancelada #${reservation.id}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reserva Cancelada</h2>
        <p>Reserva #${reservation.id} - ${reservation.client?.name}</p>
        ${
          reservation.cancellationReason
            ? `<p><strong>Motivo:</strong> ${reservation.cancellationReason}</p>`
            : ''
        }
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${config.email.from.name}" <${config.email.from.address}>`,
        to: config.admin.email,
        subject,
        html,
      });

      logger.info(`Cancellation email sent to admin`);
    } catch (error) {
      logger.error('Error sending cancellation email to admin:', error);
    }
  }
}

export default new EmailService();

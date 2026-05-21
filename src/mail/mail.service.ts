import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { formatPriceCLP } from './format-price-clp';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { Discount } from '../products/entities/discount.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { SendDiscountDto } from './dto/send-discount.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transactionalApi: SibApiV3Sdk.TransactionalEmailsApi;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');

    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = apiKey;

    this.transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendDiscountCode(sendDiscountDto: SendDiscountDto) {
    const { username, email } = sendDiscountDto;
    const code = this.generateDiscountCode();

    const html = this.buildDiscountEmail(username, code);
    const senderEmail = this.configService.get<string>('MAIL_FROM');
    const senderName = this.configService.get<string>('MAIL_FROM_NAME') ?? 'Night Market';

    if (!senderEmail) {
      throw new InternalServerErrorException('MAIL_FROM is not configured');
    }

    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.sender = {
        name: senderName,
        email: senderEmail,
      };
      sendSmtpEmail.to = [{ email, name: username }];
      sendSmtpEmail.subject = 'Tu codigo de descuento del 20% - Night Market';
      sendSmtpEmail.htmlContent = html;

      await this.transactionalApi.sendTransacEmail(sendSmtpEmail);

      await this.discountRepository.save(
        this.discountRepository.create({
          discount: code,
        }),
      );

      this.logger.log(`Discount email sent to ${email}`);
      return { message: 'Discount email sent successfully', code };
    } catch (err) {
      this.logger.error(`Failed to send email to ${email}`, err);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendOrderConfirmation(
    userName: string,
    userEmail: string,
    order: Order & { items: OrderItem[] },
    items: Array<{ productName: string; quantity: number; unitPrice: number }>,
  ) {
    const html = this.buildOrderConfirmationEmail(userName, order, items);
    const senderEmail = this.configService.get<string>('MAIL_FROM');
    const senderName = this.configService.get<string>('MAIL_FROM_NAME') ?? 'Night Market';

    if (!senderEmail) {
      throw new InternalServerErrorException('MAIL_FROM is not configured');
    }

    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.sender = {
        name: senderName,
        email: senderEmail,
      };
      sendSmtpEmail.to = [{ email: userEmail, name: userName }];
      sendSmtpEmail.subject = 'Confirmación de tu pedido - Night Market';
      sendSmtpEmail.htmlContent = html;

      await this.transactionalApi.sendTransacEmail(sendSmtpEmail);

      this.logger.log(`Order confirmation email sent to ${userEmail}`);
      return { message: 'Order confirmation email sent successfully' };
    } catch (err) {
      this.logger.error(`Failed to send order confirmation email to ${userEmail}`, err);
      throw new InternalServerErrorException('Failed to send order confirmation email');
    }
  }

  private generateDiscountCode(): string {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `NIGHT20-${random}`;
  }

  private buildDiscountEmail(username: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Código de descuento</title>
      </head>
      <body style="margin:0;padding:0;background-color:#111111;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                style="background-color:#1c1c1c;border:1px solid #3a3a3a;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

                <!-- Header -->
                <tr>
                  <td align="center" style="background-color:#000000;padding:32px 40px;border-bottom:1px solid #2f2f2f;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:2px;">NIGHT MARKET</h1>
                    <p style="margin:8px 0 0;color:#cfcfcf;font-size:14px;">Tu tienda nocturna favorita</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#e3e3e3;font-size:16px;margin:0 0 16px;">
                      Hola, <strong style="color:#ffffff;">${username}</strong> 👋
                    </p>
                    <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 32px;">
                      Queremos que vivas la mejor experiencia en Night Market.<br/>
                      Por eso te regalamos un <strong style="color:#ffffff;">20% de descuento</strong> en tu próxima compra.
                    </p>

                    <!-- Código -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color:#0d0d0d;border:2px dashed #ffffff;border-radius:10px;padding:24px;">
                          <p style="margin:0 0 8px;color:#d6d6d6;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Tu código de descuento</p>
                          <p style="margin:0;color:#ffffff;font-size:32px;font-weight:700;letter-spacing:6px;">${code}</p>
                          <p style="margin:12px 0 0;color:#9e9e9e;font-size:12px;">20% de descuento · Válido por 7 días</p>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#a8a8a8;font-size:13px;margin:32px 0 0;line-height:1.6;">
                      Ingresa este código al momento del checkout para aplicar tu descuento.<br/>
                      Una vez usado o vencido el plazo, el código no podrá ser reutilizado.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color:#000000;padding:20px 40px;border-top:1px solid #2f2f2f;">
                    <p style="margin:0;color:#8a8a8a;font-size:12px;">
                      © 2025 Night Market · Todos los derechos reservados
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private buildOrderConfirmationEmail(
    username: string,
    order: Order & { items: OrderItem[] },
    items: Array<{ productName: string; quantity: number; unitPrice: number }>,
  ): string {
    const orderItemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #2f2f2f;">
          <p style="margin:0;color:#e3e3e3;font-size:14px;">${item.productName}</p>
        </td>
        <td align="center" style="padding:12px;border-bottom:1px solid #2f2f2f;color:#d4d4d4;font-size:14px;">
          ${item.quantity} x ${formatPriceCLP(Number(item.unitPrice))}
        </td>
        <td align="right" style="padding:12px;border-bottom:1px solid #2f2f2f;color:#ffffff;font-size:14px;font-weight:600;">
          ${formatPriceCLP(item.quantity * Number(item.unitPrice))}
        </td>
      </tr>
    `,
      )
      .join('');

    const subtotal = items.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0);
    const discountAmount = order.discount ? (subtotal - Number(order.totalSell)) : 0;
    const hasDiscount = order.discount ? true : false;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Confirmación de pedido</title>
      </head>
      <body style="margin:0;padding:0;background-color:#111111;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                style="background-color:#1c1c1c;border:1px solid #3a3a3a;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

                <!-- Header -->
                <tr>
                  <td align="center" style="background-color:#000000;padding:32px 40px;border-bottom:1px solid #2f2f2f;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:2px;">NIGHT MARKET</h1>
                    <p style="margin:8px 0 0;color:#cfcfcf;font-size:14px;">Tu tienda nocturna favorita</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#e3e3e3;font-size:16px;margin:0 0 8px;">
                      ¡Hola, <strong style="color:#ffffff;">${username}</strong>! 🎉
                    </p>
                    <p style="color:#d4d4d4;font-size:15px;line-height:1.6;margin:0 0 32px;">
                      Tu pedido ha sido confirmado exitosamente. Aquí están los detalles de tu compra.
                    </p>

                    <!-- Order Details -->
                    <div style="background-color:#0d0d0d;border-radius:10px;padding:20px;margin-bottom:24px;">
                      <p style="margin:0 0 12px;color:#9e9e9e;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Número de pedido</p>
                      <p style="margin:0 0 20px;color:#ffffff;font-size:20px;font-weight:700;">#${order.id}</p>
                      
                      <p style="margin:0 0 8px;color:#9e9e9e;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Fecha</p>
                      <p style="margin:0;color:#d4d4d4;font-size:14px;">${new Date(order.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <!-- Items Table -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr style="background-color:#0d0d0d;">
                        <th style="padding:12px;text-align:left;color:#9e9e9e;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #2f2f2f;">Producto</th>
                        <th style="padding:12px;text-align:center;color:#9e9e9e;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #2f2f2f;">Cantidad</th>
                        <th style="padding:12px;text-align:right;color:#9e9e9e;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid #2f2f2f;">Total</th>
                      </tr>
                      ${orderItemsHtml}
                    </table>

                    <!-- Summary -->
                    <div style="background-color:#0d0d0d;border-radius:10px;padding:20px;margin-bottom:24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color:#9e9e9e;font-size:14px;padding:8px 0;">Subtotal:</td>
                          <td align="right" style="color:#d4d4d4;font-size:14px;padding:8px 0;">${formatPriceCLP(subtotal)}</td>
                        </tr>
                        ${hasDiscount ? `
                        <tr>
                          <td style="color:#9e9e9e;font-size:14px;padding:8px 0;">
                            Descuento (${order.discount}):
                          </td>
                          <td align="right" style="color:#4ade80;font-size:14px;font-weight:600;padding:8px 0;">
                            -${formatPriceCLP(discountAmount)}
                          </td>
                        </tr>
                        ` : ''}
                        <tr style="border-top:1px solid #2f2f2f;border-bottom:1px solid #2f2f2f;">
                          <td style="color:#ffffff;font-size:16px;font-weight:700;padding:12px 0;">Total:</td>
                          <td align="right" style="color:#ffffff;font-size:16px;font-weight:700;padding:12px 0;">${formatPriceCLP(Number(order.totalSell))}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="color:#a8a8a8;font-size:13px;margin:0;line-height:1.6;">
                      Gracias por tu compra en Night Market. Si tienes preguntas sobre tu pedido, no dudes en contactarnos.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color:#000000;padding:20px 40px;border-top:1px solid #2f2f2f;">
                    <p style="margin:0;color:#8a8a8a;font-size:12px;">
                      © 2025 Night Market · Todos los derechos reservados
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}


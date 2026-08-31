import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail', // Or whichever service you are using (e.g., SMTP host)
  auth: {
    user: process.env.EMAIL_USER, // e.g., your store's email address
    pass: process.env.EMAIL_PASS, // e.g., an App Password from Google
  },
});

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

export const sendOrderConfirmationEmail = async (
  customerEmail: string, 
  customerName: string, 
  trackingId: string, 
  total: number
) => {
  const safeName = escapeHtml(customerName);
  const safeTrackingId = escapeHtml(trackingId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Confirmation - Nails by Rimal (${trackingId})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your order, ${safeName}!</h2>
        <p>Your order has been received and is currently being processed.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Tracking ID: <strong>${safeTrackingId}</strong></h3>
          <p>Total Amount: <strong>Rs. ${total}</strong></p>
          <p>Payment Method: Cash on Delivery (COD)</p>
        </div>
        <p>You can track the status of your order anytime on our website using your Tracking ID.</p>
        ${siteUrl ? `<a href="${escapeHtml(siteUrl)}/trackOrder" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track My Order</a>` : ''}
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

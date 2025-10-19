// Simplified, spam-proof email templates

export const bookingConfirmationTemplate = (data) => {
  const { booking, clientName, clientEmail, services, staff, totalPrice, totalDuration } = data

  const servicesHtml = services
    .map(
      (service) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${service.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${service.duration} mins</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${service.regularPrice}</td>
    </tr>
  `
    )
    .join('')

  const bookingDate = new Date(booking.date)
  const formattedDate = bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const bookingTime = booking.startTime
    ? new Date(booking.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Time TBD'

  // Plain text version for better deliverability
  const plainText = `
APPOINTMENT CONFIRMATION

Hello ${clientName},

Your appointment has been confirmed at Nailaholics Nails & Beauty.

BOOKING REFERENCE: #${booking.id}

APPOINTMENT DETAILS
-------------------
Date: ${formattedDate}
Time: ${bookingTime}
Artist: ${staff?.name || 'Any Available Artist'}
Duration: ${totalDuration} minutes

SERVICES BOOKED
---------------
${services.map((s) => `${s.name} - ${s.duration} mins - $${s.regularPrice}`).join('\n')}

TOTAL: $${totalPrice}

${booking.notes ? `YOUR NOTES\n----------\n${booking.notes}\n\n` : ''}LOCATION
--------
Nailaholics Nails & Beauty
4B Pitt St
Mortdale NSW 2223
Phone: (02) 9579 1881

IMPORTANT
---------
Please arrive 5 minutes before your appointment time.
Cancellations must be made at least 24 hours in advance.

If you need to make any changes to your appointment, please contact us at (02) 9579 1881 or reply to this email.

Thank you for choosing NAILAHOLICS!

---
Nailaholics Nails & Beauty
4B Pitt St, Mortdale NSW 2223
© ${new Date().getFullYear()} Nailaholics Nails & Beauty. All rights reserved.
  `.trim()

  return {
    subject: `Appointment Confirmation #${booking.id} - Nailaholics Nails & Beauty`,
    text: plainText,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          
          <!-- Simple header -->
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
            <tr>
              <td style="padding: 40px 20px; text-align: center; background-color: #f9fafb; border-bottom: 3px solid #3b82f6;">
                <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">
                  Appointment Confirmation
                </h1>
                <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
                  Booking Reference: #${booking.id}
                </p>
              </td>
            </tr>
          </table>

          <!-- Main content -->
          <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
            <tr>
              <td>
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                  Hello ${clientName},
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                  Your appointment at <strong>Nailaholics Nails & Beauty</strong> has been confirmed.
                </p>

                <!-- Appointment details -->
                <table style="width: 100%; margin: 30px 0; border-collapse: collapse; border: 1px solid #e5e7eb;">
                  <tr style="background-color: #f9fafb;">
                    <td colspan="2" style="padding: 12px; border-bottom: 2px solid #e5e7eb;">
                      <strong style="color: #1f2937; font-size: 16px;">Appointment Details</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 120px;">
                      Date
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">
                      ${formattedDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
                      Time
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">
                      ${bookingTime}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
                      Artist
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">
                      ${staff?.name || 'Any Available Artist'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; color: #6b7280;">
                      Duration
                    </td>
                    <td style="padding: 12px; color: #1f2937; font-weight: 500;">
                      ${totalDuration} minutes
                    </td>
                  </tr>
                </table>

                <!-- Services -->
                <h2 style="color: #1f2937; font-size: 18px; margin: 30px 0 15px 0; font-weight: 600;">Services</h2>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Service</th>
                      <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Duration</th>
                      <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${servicesHtml}
                    <tr style="background-color: #f9fafb;">
                      <td colspan="2" style="padding: 12px; font-weight: 600; color: #1f2937;">Total</td>
                      <td style="padding: 12px; text-align: right; font-weight: 600; color: #1f2937; font-size: 18px;">$${totalPrice}</td>
                    </tr>
                  </tbody>
                </table>

                ${
                  booking.notes
                    ? `
                <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e; font-weight: 600;">Your Notes:</p>
                  <p style="margin: 8px 0 0 0; color: #78350f;">${booking.notes}</p>
                </div>
                `
                    : ''
                }

                <!-- Location -->
                <h2 style="color: #1f2937; font-size: 18px; margin: 30px 0 15px 0; font-weight: 600;">Location</h2>
                <div style="padding: 15px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
                  <p style="color: #1f2937; margin: 0 0 5px 0; font-weight: 600;">Nailaholics Nails & Beauty</p>
                  <p style="color: #374151; margin: 0;">4B Pitt St<br>Mortdale NSW 2223</p>
                  <p style="color: #374151; margin: 10px 0 0 0;">Phone: (02) 9579 1881</p>
                </div>

                <!-- Important notice -->
                <div style="margin: 30px 0; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px;">
                    <strong>Important:</strong> Please arrive 5 minutes early. Cancellations require 24 hours notice.
                  </p>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0;">
                  If you need to make any changes, please edit your appointment on the website or contact us:<br>
                  Phone: <a href="tel:0295791881" style="color: #3b82f6; text-decoration: none;">(02) 9579 1881</a><br>
                  Email: <a href="mailto:nailaholics.official@gmail.com" style="color: #3b82f6; text-decoration: none;">nailaholics.official@gmail.com</a>
                </p>

                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Thank you,<br>
                  <strong>Nailaholics Nails & Beauty</strong>
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f9fafb; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
                Nailaholics Nails & Beauty<br>
                4B Pitt St, Mortdale NSW 2223<br>
                Phone: (02) 9579 1881<br>
                <span style="color: #9ca3af;">© ${new Date().getFullYear()} Nailaholics Nails & Beauty. All rights reserved.</span>
              </td>
            </tr>
          </table>

        </body>
      </html>
    `,
  }
}

export const bookingUpdateTemplate = (data) => {
  const { booking, clientName, services, staff, totalPrice, totalDuration } = data

  const bookingDate = new Date(booking.date)
  const formattedDate = bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const bookingTime = booking.startTime
    ? new Date(booking.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Time TBD'

  const plainText = `
APPOINTMENT UPDATED

Hello ${clientName},

Your appointment #${booking.id} at Nailaholics Nails & Beauty has been updated.

UPDATED DETAILS
---------------
Date: ${formattedDate}
Time: ${bookingTime}
Artist: ${staff?.name || 'Any Available Artist'}
Total: $${totalPrice}

LOCATION
--------
Nailaholics Nails & Beauty
4B Pitt St, Mortdale NSW 2223
Phone: (02) 9579 1881

If you have any questions, please contact us at (02) 9579 1881.

Thank you,
Nailaholics Nails & Beauty 

---
© ${new Date().getFullYear()} Nailaholics Nails & Beauty. All rights reserved.
  `.trim()

  return {
    subject: `Appointment Updated #${booking.id} - Nailaholics Nails & Beauty`,
    text: plainText,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px; text-align: center; background-color: #fef3c7; border-bottom: 3px solid #f59e0b;">
                <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">
                  Appointment Updated
                </h1>
                <p style="color: #92400e; margin: 8px 0 0 0; font-size: 14px;">
                  Booking Reference: #${booking.id}
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
            <tr>
              <td>
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                  Hello ${clientName},
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                  Your appointment at <strong>Nailaholics Nails & Beauty</strong> has been updated.
                </p>

                <table style="width: 100%; margin: 30px 0; border-collapse: collapse; border: 1px solid #e5e7eb;">
                  <tr style="background-color: #fef3c7;">
                    <td colspan="2" style="padding: 12px; border-bottom: 2px solid #f59e0b;">
                      <strong style="color: #1f2937;">Updated Details</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 120px;">Date</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Time</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">${bookingTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Artist</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-weight: 500;">${
                      staff?.name || 'Any Available Artist'
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; color: #6b7280;">Total</td>
                    <td style="padding: 12px; color: #1f2937; font-weight: 600; font-size: 18px;">$${totalPrice}</td>
                  </tr>
                </table>

                <h2 style="color: #1f2937; font-size: 18px; margin: 30px 0 15px 0; font-weight: 600;">Location</h2>
                <div style="padding: 15px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
                  <p style="color: #1f2937; margin: 0 0 5px 0; font-weight: 600;">Nailaholics Nails & Beauty</p>
                  <p style="color: #374151; margin: 0;">4B Pitt St, Mortdale NSW 2223</p>
                  <p style="color: #374151; margin: 10px 0 0 0;">Phone: (02) 9579 1881</p>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0;">
                  If you have any questions, please contact us at <a href="tel:0295791881" style="color: #3b82f6; text-decoration: none;">(02) 9579 1881</a>
                </p>

                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Thank you,<br>
                  <strong>Nailaholics Nails & Beauty</strong>
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f9fafb; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
                © ${new Date().getFullYear()} Nailaholics Nails & Beauty. All rights reserved.
              </td>
            </tr>
          </table>

        </body>
      </html>
    `,
  }
}

export const bookingCancellationTemplate = (data) => {
  const { booking, clientName } = data

  const bookingDate = new Date(booking.date)
  const formattedDate = bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const bookingTime = booking.startTime
    ? new Date(booking.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'Time TBD'

  const plainText = `
APPOINTMENT CANCELLED

Hello ${clientName},

Your appointment #${booking.id} at Nailaholics Nails & Beauty has been cancelled as requested.

CANCELLED APPOINTMENT
---------------------
Date: ${formattedDate}
Time: ${bookingTime}

We hope to see you again soon! You can book a new appointment anytime.

CONTACT US
----------
Nailaholics Nails & Beauty
4B Pitt St, Mortdale NSW 2223
Phone: (02) 9579 1881

If this cancellation was made in error, please contact us immediately.

Thank you,
Nailaholics Nails & Beauty 

---
© ${new Date().getFullYear()} Nailaholics Nails & Beauty. All rights reserved.
  `.trim()

  return {
    subject: `Appointment Cancelled #${booking.id} - Nailaholics Nails & Beauty`,
    text: plainText,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
          
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px; text-align: center; background-color: #fef2f2; border-bottom: 3px solid #ef4444;">
                <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">
                  Appointment Cancelled
                </h1>
                <p style="color: #991b1b; margin: 8px 0 0 0; font-size: 14px;">
                  Booking Reference: #${booking.id}
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
            <tr>
              <td>
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                  Hello ${clientName},
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                  Your appointment at <strong>Nailaholics Nails & Beauty</strong> has been cancelled as requested.
                </p>

                <div style="margin: 30px 0; padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444;">
                  <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">Cancelled Appointment</p>
                  <p style="margin: 5px 0; color: #6b7280;">Date: <span style="color: #1f2937; font-weight: 500;">${formattedDate}</span></p>
                  <p style="margin: 5px 0; color: #6b7280;">Time: <span style="color: #1f2937; font-weight: 500;">${bookingTime}</span></p>
                </div>

                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 20px 0;">
                  We hope to see you again soon! You can book a new appointment anytime.
                </p>

                <h2 style="color: #1f2937; font-size: 18px; margin: 30px 0 15px 0; font-weight: 600;">Contact Us</h2>
                <div style="padding: 15px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
                  <p style="color: #1f2937; margin: 0 0 5px 0; font-weight: 600;">Nailaholics Nails & Beauty</p>
                  <p style="color: #374151; margin: 0;">4B Pitt St, Mortdale NSW 2223</p>
                  <p style="color: #374151; margin: 10px 0 0 0;">Phone: (02) 9579 1881</p>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0;">
                  If this cancellation was made in error, please contact us immediately at <a href="tel:0295791881" style="color: #3b82f6; text-decoration: none;">(02) 9579 1881</a>
                </p>

                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Thank you,<br>
                  <strong>Nailaholics Nails & Beauty</strong>
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 20px; text-align: center; background-color: #f9fafb; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb;">
                © ${new Date().getFullYear()} Nailaholics Nails & Beauty. All rights reserved.
              </td>
            </tr>
          </table>

        </body>
      </html>
    `,
  }
}

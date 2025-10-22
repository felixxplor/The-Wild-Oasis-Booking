import { Resend } from 'resend'
import {
  bookingConfirmationTemplate,
  bookingUpdateTemplate,
  bookingCancellationTemplate,
} from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmationEmail(data) {
  try {
    // console.log('📧 [EMAIL] Starting confirmation email')
    // console.log('📧 [EMAIL] Recipient:', data.clientEmail)

    const { clientEmail, clientName, booking, services, staff } = data

    // Calculate totals
    const totalPrice = booking.totalPrice
    const totalDuration = services.reduce((sum, service) => sum + (service.duration || 0), 0)

    const emailTemplate = bookingConfirmationTemplate({
      booking,
      clientName,
      clientEmail,
      services,
      staff,
      totalPrice,
      totalDuration,
    })

    // console.log('📧 [EMAIL] Calling Resend API...')
    // console.log('📧 [EMAIL] From:', 'NAILAHOLICS <bookings@nailaholics.com.au>')
    // console.log('📧 [EMAIL] To:', clientEmail)
    // console.log('📧 [EMAIL] Subject:', emailTemplate.subject)

    const { data: emailData, error } = await resend.emails.send({
      from: 'Nailaholics Nails & Beauty <bookings@nailaholics.com.au>',
      reply_to: 'nailaholics.official@gmail.com',
      to: [clientEmail],
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    })

    if (error) {
      // console.error('❌ [EMAIL] Resend API error:', error)
      // console.error('❌ [EMAIL] Error details:', JSON.stringify(error, null, 2))
      throw new Error(`Resend error: ${error.message}`)
    }

    // console.log('✅ [EMAIL] Email sent successfully!')
    // console.log('✅ [EMAIL] Email ID:', emailData?.id)
    // console.log('✅ [EMAIL] Full response:', JSON.stringify(emailData, null, 2))

    return emailData
  } catch (error) {
    // console.error('❌ [EMAIL] Fatal error:', error)
    // console.error('❌ [EMAIL] Stack:', error.stack)
    throw error
  }
}

export async function sendBookingUpdateEmail(data) {
  try {
    // console.log('📧 [EMAIL SERVICE] Starting sendBookingUpdateEmail')
    const { clientEmail, clientName, booking, services, staff } = data

    const totalPrice = booking.totalPrice
    const totalDuration = services.reduce((sum, service) => sum + (service.duration || 0), 0)

    const emailTemplate = bookingUpdateTemplate({
      booking,
      clientName,
      services,
      staff,
      totalPrice,
      totalDuration,
    })

    // console.log('📧 [EMAIL SERVICE] Calling Resend API for update email...')

    const { data: emailData, error } = await resend.emails.send({
      from: 'Nailaholics Nails & Beauty <bookings@nailaholics.com.au>',
      reply_to: 'nailaholics.official@gmail.com',
      to: [clientEmail],
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    })

    if (error) {
      // console.error('❌ [EMAIL SERVICE] Resend error:', error)
      throw new Error(`Resend error: ${error.message}`)
    }

    // console.log('✅ [EMAIL SERVICE] Update email sent successfully!')
    return emailData
  } catch (error) {
    // console.error('❌ [EMAIL SERVICE] Error in sendBookingUpdateEmail:', error)
    throw error
  }
}

export async function sendCancellationEmail(data) {
  try {
    // console.log('📧 [EMAIL SERVICE] Starting sendCancellationEmail')
    const { clientEmail, clientName, booking } = data

    const emailTemplate = bookingCancellationTemplate({
      booking,
      clientName,
    })

    // console.log('📧 [EMAIL SERVICE] Calling Resend API for cancellation email...')

    const { data: emailData, error } = await resend.emails.send({
      from: 'Nailaholics Nails & Beauty <bookings@nailaholics.com.au>',
      reply_to: 'nailaholics.official@gmail.com',
      to: [clientEmail],
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    })

    if (error) {
      // console.error('❌ [EMAIL SERVICE] Resend error:', error)
      throw new Error(`Resend error: ${error.message}`)
    }

    // console.log('✅ [EMAIL SERVICE] Cancellation email sent successfully!')
    return emailData
  } catch (error) {
    // console.error('❌ [EMAIL SERVICE] Error in sendCancellationEmail:', error)
    throw error
  }
}

export async function sendBookingUpdateNotificationEmail(data) {
  try {
    // console.log('📧 [EMAIL SERVICE] Starting sendBookingUpdateNotificationEmail')
    const { businessEmail, clientEmail, clientName, booking, services, staff, previousBooking } =
      data

    const totalPrice = booking.totalPrice
    const totalDuration = services.reduce((sum, service) => sum + (service.duration || 0), 0)

    // Format date and time for display
    const formatDateTime = (dateString, timeString) => {
      const date = new Date(dateString || timeString)
      return {
        date: date.toLocaleDateString('en-AU', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: date.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      }
    }

    const { date: formattedDate, time: formattedTime } = formatDateTime(
      booking.date,
      booking.startTime
    )
    const serviceList = services.map((s) => s.name).join(', ')
    const staffName = staff ? staff.name : 'Any available staff'

    // Build change summary if previous booking data is available
    let changesSummary = ''
    if (previousBooking) {
      const changes = []

      if (
        previousBooking.date !== booking.date ||
        previousBooking.startTime !== booking.startTime
      ) {
        const oldDateTime = formatDateTime(previousBooking.date, previousBooking.startTime)
        changes.push(
          `• Date/Time: ${oldDateTime.date} at ${oldDateTime.time} → ${formattedDate} at ${formattedTime}`
        )
      }

      if (previousBooking.staffId !== booking.staffId) {
        changes.push(`• Staff member changed`)
      }

      if (JSON.stringify(previousBooking.serviceIds) !== JSON.stringify(booking.serviceIds)) {
        changes.push(`• Services modified`)
      }

      if (previousBooking.totalPrice !== booking.totalPrice) {
        changes.push(`• Price: $${previousBooking.totalPrice} → $${totalPrice}`)
      }

      if (changes.length > 0) {
        changesSummary = `\n\nChanges Made:\n${changes.join('\n')}`
      }
    }

    // Email subject
    const subject = `🔔 Booking Updated - ${clientName}`

    // Plain text version
    const text = `
BOOKING UPDATED

A customer has updated their booking.

Customer Details:
- Name: ${clientName}
- Email: ${clientEmail}

Updated Booking Details:
- Booking ID: ${booking.id}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Services: ${serviceList}
- Staff: ${staffName}
- Duration: ${totalDuration} minutes
- Total Price: $${totalPrice}
${booking.notes ? `- Notes: ${booking.notes}` : ''}${changesSummary}

Please review and confirm this updated booking.
    `.trim()

    // HTML version
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Updated</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">🔔 Booking Updated</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                A customer has updated their booking.
              </p>

              <!-- Customer Details -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #FF6B9D; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px; color: #333333; font-size: 18px;">Customer Details</h2>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Name:</strong> ${clientName}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Email:</strong> ${clientEmail}</p>
              </div>

              <!-- Booking Details -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #C239B3; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px; color: #333333; font-size: 18px;">Updated Booking Details</h2>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Booking ID:</strong> ${
                  booking.id
                }</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Time:</strong> ${formattedTime}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Services:</strong> ${serviceList}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Staff:</strong> ${staffName}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Duration:</strong> ${totalDuration} minutes</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Total Price:</strong> $${totalPrice}</p>
                ${
                  booking.notes
                    ? `<p style="margin: 15px 0 5px; color: #555555; font-size: 14px;"><strong>Notes:</strong></p><p style="margin: 5px 0; color: #555555; font-size: 14px; font-style: italic;">${booking.notes}</p>`
                    : ''
                }
              </div>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                Please review and confirm this updated booking in your booking management system.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Nailaholics Nails & Beauty<br>
                This is an automated notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    // console.log('📧 [EMAIL SERVICE] Calling Resend API for business update notification...')

    const { data: emailData, error } = await resend.emails.send({
      from: 'Nailaholics Nails & Beauty <bookings@nailaholics.com.au>',
      to: [businessEmail],
      subject: subject,
      text: text,
      html: html,
    })

    if (error) {
      // console.error('❌ [EMAIL SERVICE] Resend error:', error)
      throw new Error(`Resend error: ${error.message}`)
    }

    // console.log('✅ [EMAIL SERVICE] Business update notification sent successfully!')
    return emailData
  } catch (error) {
    // console.error('❌ [EMAIL SERVICE] Error in sendBookingUpdateNotificationEmail:', error)
    throw error
  }
}

export async function sendCancellationNotificationEmail(data) {
  try {
    // console.log('📧 [EMAIL SERVICE] Starting sendCancellationNotificationEmail')
    const { businessEmail, clientEmail, clientName, booking, services, staff } = data

    const totalPrice = booking.totalPrice || booking.price

    // Format date and time for display
    const formatDateTime = (dateString, timeString) => {
      const date = new Date(dateString || timeString)
      return {
        date: date.toLocaleDateString('en-AU', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: date.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      }
    }

    const { date: formattedDate, time: formattedTime } = formatDateTime(
      booking.date,
      booking.startTime
    )
    const serviceList =
      services && services.length > 0 ? services.map((s) => s.name).join(', ') : 'N/A'
    const staffName = staff ? staff.name : 'Any available staff'
    const totalDuration =
      services && services.length > 0
        ? services.reduce((sum, service) => sum + (service.duration || 0), 0)
        : 0

    // Email subject
    const subject = `❌ Booking Cancelled - ${clientName}`

    // Plain text version
    const text = `
BOOKING CANCELLED

A customer has cancelled their booking.

Customer Details:
- Name: ${clientName}
- Email: ${clientEmail}

Cancelled Booking Details:
- Booking ID: ${booking.id}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Services: ${serviceList}
- Staff: ${staffName}
- Duration: ${totalDuration} minutes
- Total Price: $${totalPrice}
${booking.notes ? `- Notes: ${booking.notes}` : ''}

This time slot is now available for other bookings.
    `.trim()

    // HTML version
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">❌ Booking Cancelled</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                A customer has cancelled their booking.
              </p>

              <!-- Customer Details -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #dc3545; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px; color: #333333; font-size: 18px;">Customer Details</h2>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Name:</strong> ${clientName}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Email:</strong> ${clientEmail}</p>
              </div>

              <!-- Cancelled Booking Details -->
              <div style="background-color: #fff5f5; border-left: 4px solid #c82333; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px; color: #333333; font-size: 18px;">Cancelled Booking Details</h2>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Booking ID:</strong> ${
                  booking.id
                }</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Time:</strong> ${formattedTime}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Services:</strong> ${serviceList}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Staff:</strong> ${staffName}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Duration:</strong> ${totalDuration} minutes</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Total Price:</strong> $${totalPrice}</p>
                ${
                  booking.notes
                    ? `<p style="margin: 15px 0 5px; color: #555555; font-size: 14px;"><strong>Notes:</strong></p><p style="margin: 5px 0; color: #555555; font-size: 14px; font-style: italic;">${booking.notes}</p>`
                    : ''
                }
              </div>

              <!-- Action Required -->
              <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 10px; color: #0c5460; font-size: 16px;">📅 Time Slot Available</h2>
                <p style="margin: 0; color: #0c5460; font-size: 14px;">
                  This time slot is now available for other bookings.
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                Please update your booking calendar accordingly.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Nailaholics Nails & Beauty<br>
                This is an automated notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    // console.log('📧 [EMAIL SERVICE] Calling Resend API for business cancellation notification...')

    const { data: emailData, error } = await resend.emails.send({
      from: 'Nailaholics Nails & Beauty <bookings@nailaholics.com.au>',
      to: [businessEmail],
      subject: subject,
      text: text,
      html: html,
    })

    if (error) {
      // console.error('❌ [EMAIL SERVICE] Resend error:', error)
      throw new Error(`Resend error: ${error.message}`)
    }

    // console.log('✅ [EMAIL SERVICE] Business cancellation notification sent successfully!')
    return emailData
  } catch (error) {
    // console.error('❌ [EMAIL SERVICE] Error in sendCancellationNotificationEmail:', error)
    throw error
  }
}

export async function sendBookingNotificationEmail(data) {
  try {
    // console.log('📧 [EMAIL SERVICE] Starting sendBookingNotificationEmail')
    const { businessEmail, clientEmail, clientName, booking, services, staff } = data

    const totalPrice = booking.totalPrice || booking.price
    const totalDuration = services.reduce((sum, service) => sum + (service.duration || 0), 0)

    // Format date and time for display
    const formatDateTime = (dateString, timeString) => {
      const date = new Date(dateString || timeString)
      return {
        date: date.toLocaleDateString('en-AU', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: date.toLocaleTimeString('en-AU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      }
    }

    const { date: formattedDate, time: formattedTime } = formatDateTime(
      booking.date,
      booking.startTime
    )
    const serviceList = services.map((s) => s.name).join(', ')
    const staffName = staff ? staff.name : 'Any available staff'

    // Email subject
    const subject = `✨ New Booking - ${clientName}`

    // Plain text version
    const text = `
NEW BOOKING RECEIVED

You have received a new booking!

Customer Details:
- Name: ${clientName}
- Email: ${clientEmail}
${booking.phone ? `- Phone: ${booking.phone}` : ''}

Booking Details:
- Booking ID: ${booking.id}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Services: ${serviceList}
- Staff: ${staffName}
- Duration: ${totalDuration} minutes
- Total Price: $${totalPrice}
- Status: ${booking.status || 'Pending'}
${booking.notes ? `- Notes: ${booking.notes}` : ''}

Please confirm this booking as soon as possible.
    `.trim()

    // HTML version
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">✨ New Booking Received!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                Great news! You have received a new booking.
              </p>

              <!-- Customer Details -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #FF6B9D; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px; color: #333333; font-size: 18px;">Customer Details</h2>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Name:</strong> ${clientName}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${clientEmail}" style="color: #FF6B9D; text-decoration: none;">${clientEmail}</a></p>
                ${
                  booking.phone
                    ? `<p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${booking.phone}" style="color: #FF6B9D; text-decoration: none;">${booking.phone}</a></p>`
                    : ''
                }
              </div>

              <!-- Booking Details -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #C239B3; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px; color: #333333; font-size: 18px;">Booking Details</h2>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Booking ID:</strong> ${
                  booking.id
                }</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Time:</strong> ${formattedTime}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Services:</strong> ${serviceList}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Staff:</strong> ${staffName}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Duration:</strong> ${totalDuration} minutes</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Total Price:</strong> $${totalPrice}</p>
                <p style="margin: 5px 0; color: #555555; font-size: 14px;"><strong>Status:</strong> <span style="display: inline-block; padding: 4px 8px; background-color: #fff3cd; color: #856404; border-radius: 4px; font-size: 12px; font-weight: bold;">${
                  booking.status || 'PENDING'
                }</span></p>
                ${
                  booking.notes
                    ? `<p style="margin: 15px 0 5px; color: #555555; font-size: 14px;"><strong>Customer Notes:</strong></p><p style="margin: 5px 0; color: #555555; font-size: 14px; font-style: italic; background-color: #fffbea; padding: 10px; border-radius: 4px;">${booking.notes}</p>`
                    : ''
                }
              </div>

              <!-- Action Required -->
              <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 10px; color: #155724; font-size: 16px;">⏰ Action Required</h2>
                <p style="margin: 0; color: #155724; font-size: 14px;">
                  Please confirm this booking as soon as possible to ensure customer satisfaction.
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                Log in to your booking management system to view full details and manage this booking.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Nailaholics Nails & Beauty<br>
                This is an automated notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()

    // console.log('📧 [EMAIL SERVICE] Calling Resend API for business booking notification...')

    const { data: emailData, error } = await resend.emails.send({
      from: 'Nailaholics Nails & Beauty <bookings@nailaholics.com.au>',
      to: [businessEmail],
      subject: subject,
      text: text,
      html: html,
    })

    if (error) {
      // console.error('❌ [EMAIL SERVICE] Resend error:', error)
      throw new Error(`Resend error: ${error.message}`)
    }

    // console.log('✅ [EMAIL SERVICE] Business booking notification sent successfully!')
    return emailData
  } catch (error) {
    // console.error('❌ [EMAIL SERVICE] Error in sendBookingNotificationEmail:', error)
    throw error
  }
}

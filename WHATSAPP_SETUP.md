# WhatsApp Notifications Setup

This application uses UltraMsg API to send WhatsApp confirmation messages for grooming bookings.

## Required Environment Variables

Add these to your `.env.local` file (and Vercel environment variables for production):

```bash
# UltraMsg WhatsApp API
ULTRAMSG_INSTANCE_ID=instance156860
ULTRAMSG_TOKEN=0zbo1terddsqraiu

# Base URL (required for WhatsApp API calls)
NEXT_PUBLIC_BASE_URL=https://www.stephanspetstore.co.tz
```

## How It Works

1. **Customer Books Grooming** - Customer fills out the booking form on `/grooming`
2 **Booking Created** - System creates booking in Sanity and syncs to Odoo
3. **WhatsApp Sent** - Automatic WhatsApp confirmation sent to customer's phone
4. **Customer Receives** - Customer gets detailed booking confirmation on WhatsApp

## Message Format

The WhatsApp message includes:
- Booking confirmation number
- Pet details (name, type, size)
- Package selected
- Date and time of appointment
- Total price
- Location and directions
- Important reminders

## API Endpoint

**POST** `/api/whatsapp/send`

Request body:
```json
{
  "to": "+255769324445",
  "body": "Your message here"
}
```

Response:
```json
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "data": {}
}
```

## Testing

To test WhatsApp notifications locally:

1. Set environment variables in `.env.local`
2. Run development server: `npm run dev`
3fill out grooming booking form
4. Check WhatsApp for confirmation message

## UltraMsg Account

- **Dashboard**: https://api.ultramsg.com/
- **Instance ID**: `instance156860`
- **Token**: `0zbo1terddsqraiu`

Update these credentials if you create a new UltraMsg instance.

## Troubleshooting

If WhatsApp messages aren't sending:

1. **Check environment variables** - Ensure `ULTRAMSG_INSTANCE_ID` and `ULTRAMSG_TOKEN` are set
2. **Verify phone number format** - Must start with `+` (e.g., `+255769324445`)
3. **Check UltraMsg instance status** - Login to UltraMsg dashboard to verify instance is active
4. **Review logs** - Check server logs for any WhatsApp API errors

## Production Deployment

When deploying to Vercel:

1. Go to Vercel project settings
2. Navigate to Environment Variables
3. Add the UltraMsg credentials:
   - `ULTRAMSG_INSTANCE_ID`
   - `ULTRAMSG_TOKEN`
   - `NEXT_PUBLIC_BASE_URL`
4. Redeploy the application

## Notes

- WhatsApp notification failures won't prevent booking creation
- Errors are logged but don't affect the booking flow
- Messages are sent asynchronously
- Rate limits apply based on your UltraMsg plan

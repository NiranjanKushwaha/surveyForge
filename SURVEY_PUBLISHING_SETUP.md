# Survey Publishing Setup Guide

## Environment Configuration

### Frontend (Port 4001)
The frontend is already configured to run on port 4001. The API calls will automatically use the correct origin.

### Backend (Port 3000)
The backend is configured to generate public links pointing to port 4001. If you need to change this, update the `FRONTEND_URL` environment variable in your backend:

```bash
# In your backend environment
export FRONTEND_URL=http://localhost:4001
```

Or add it to your backend `.env` file:
```
FRONTEND_URL=http://localhost:4001
```

## How to Use the Survey Publishing System

### 1. Start Your Applications
```bash
# Terminal 1 - Backend (usually port 3000)
cd /Users/niranjan.kushwaha/Desktop/Projects/personal/Survey/surveyforge-backEnd
npm run start:dev

# Terminal 2 - Frontend (port 4001)
cd /Users/niranjan.kushwaha/Desktop/Projects/personal/Survey/surveyforge
npm run dev
```

### 2. Create and Publish a Survey
1. Open http://localhost:4001
2. Create a new survey or edit an existing one
3. Click "More Actions" (three dots) in the floating toolbar
4. Click "Publish Survey"
5. Click "Get Public Link" to generate the shareable URL

### 3. Share Your Survey
- **Copy Link**: Direct link copying to clipboard
- **Social Media**: Share to Twitter, Facebook, LinkedIn, WhatsApp
- **Email**: Pre-filled email with survey details
- **QR Code**: Generate QR code for easy mobile access

### 4. Survey URLs
Your published surveys will be accessible at:
```
http://localhost:4001/survey-viewer/{surveyId}
```

### 5. Mobile Testing
- Open the survey link on any mobile device
- The survey will automatically adapt to mobile screens
- Responses are saved to your database automatically

## Features Implemented

✅ **Survey Publishing**: Publish/unpublish surveys with one click
✅ **Public Access**: Anyone with the link can take the survey
✅ **Mobile Responsive**: Works perfectly on all devices
✅ **Response Collection**: All responses saved to your database
✅ **Social Sharing**: Multiple sharing options including QR codes
✅ **Real-time Status**: Live status updates in the builder

## Troubleshooting

### If public links don't work:
1. Ensure your backend is running on port 3000
2. Check that the survey is published (status = 'published')
3. Verify the frontend is running on port 4001

### If responses aren't saving:
1. Check backend logs for any errors
2. Ensure the database connection is working
3. Verify the survey is published and accessible

The system is now ready for production use! 🚀

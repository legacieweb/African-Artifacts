# 🌍 Dashboard Account Management Features

## Overview
The redesigned dashboard provides a complete account management system where users can:
- View and edit personal information
- Manage shipping addresses
- View order history
- Automatically save profile details during checkout

## Features

### 1. **Profile Management**
Users can:
- View their personal information (name, email, phone, join date)
- Edit their name and phone number
- Secure email field (read-only)

**Location**: Dashboard > Profile tab

### 2. **Address Management**
Users can:
- Save and manage shipping addresses
- View saved address details
- Edit address information at any time
- See address completion status

**Location**: Dashboard > Addresses tab

**Address Fields**:
- Street Address
- City
- State/Province
- Country
- Postal/Zip Code

### 3. **Order History**
Users can:
- View all their past orders
- See order status (processing, completed, cancelled)
- View order details including items and amounts
- Track payment status

**Location**: Dashboard > Orders tab

## Auto-Save Features

### Checkout Profile Saving
When users enter shipping information during checkout, the system will ask if they want to save these details after successful payment.

**Behavior**:
1. **New Users** (no saved address):
   - After payment, prompted to save address
   - Message indicates "This will be your first saved address"
   
2. **Existing Users** (has saved data):
   - Prompted only if they entered different information than what's saved
   - Can choose to save changes or skip
   - Original data is preserved if they choose to skip

### Modal Prompts
- Clean, user-friendly modals ask for confirmation
- Shows preview of data being saved
- Options to save or skip for now
- Success notification after saving

## MongoDB Storage

### User Model Fields
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  createdAt: Date (auto)
}
```

### Data Persistence
- All profile changes are saved to MongoDB
- Address data is retrieved and pre-filled in checkout
- Phone number is saved for order contact
- Changes are immediately reflected in dashboard

## API Integration

### Profile Endpoints
```
GET  /api/auth/profile        - Get user profile
PUT  /api/auth/profile        - Update user profile
```

### Profile Update Payload
```javascript
{
  name: "John Doe",
  phone: "+254712345678",
  address: {
    street: "123 Main St",
    city: "Nairobi",
    state: "Nairobi County",
    country: "Kenya",
    zipCode: "00200"
  }
}
```

## User Experience Flow

### First-Time User
1. Register account
2. Go to checkout
3. Fill in shipping details
4. After payment, prompted to save profile
5. Details saved to MongoDB
6. Next checkout pre-fills their information

### Returning User
1. Login
2. Dashboard shows their saved profile
3. Go to checkout
4. Details auto-filled from saved profile
5. Can edit if needed
6. If details differ from saved, prompted to save changes after payment

### Profile Update Flow
1. Navigate to Dashboard
2. Click "Edit Profile" or "Edit Address"
3. Modify information
4. Click "Save Changes"
5. Prompted to confirm save
6. Change saved to MongoDB
7. Success notification shown

## UI Components

### Responsive Design
- Mobile-friendly layout
- Tabs convert to scrollable list on mobile
- Forms stack properly on small screens
- Modals adapt to screen size

### Accessibility
- Clear labels on all form fields
- Error messages and alerts
- Status indicators for profile completion
- Keyboard navigation support

### Visual Feedback
- Success alerts (green)
- Error alerts (red)
- Warning alerts (orange)
- Info alerts (blue)
- Loading states with spinners
- Smooth animations

## File Structure

```
dashboard.html                    - Main dashboard page
js/api.js                         - API layer (existing)
js/checkout-profile-manager.js   - Checkout profile auto-save
checkout.html                     - Updated with profile manager
routes/auth.js                    - Backend auth endpoints
models/User.js                    - User schema with address
```

## Setup Instructions

### Backend
1. Ensure MongoDB is running
2. Verify User model has address field:
```javascript
address: {
  street: String,
  city: String,
  state: String,
  country: String,
  zipCode: String
}
```
3. Update/PUT endpoint is available at `/api/auth/profile`

### Frontend
1. Dashboard available at `/dashboard.html`
2. Checkout manager auto-loaded in checkout
3. API URL configured in `js/api.js`

### Environment
```
PAYSTACK_SECRET_KEY=your_key
PAYSTACK_CURRENCY=NGN
FRONTEND_URL=http://localhost:5000
API_BASE_URL=http://localhost:5000/api
```

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations
- Password field never displayed or edited in dashboard
- Email field read-only in checkout
- All updates require authentication token
- Data validation on both client and server
- Sensitive data excluded from localStorage

## Future Enhancements
- Multiple addresses saved
- Set default address
- Address book management
- Payment method management
- Notification preferences
- Account security settings
- Two-factor authentication
- Download order receipts
- Rate and review products

## Troubleshooting

### Profile not loading
- Check localStorage for authToken
- Verify MongoDB connection
- Check browser console for errors
- Ensure api.js is loaded

### Changes not saving
- Check network connection
- Verify PAYSTACK_SECRET_KEY is set
- Check MongoDB connection
- Review browser console for errors

### Modals not appearing
- Verify checkout-profile-manager.js is loaded
- Check z-index conflicts in CSS
- Ensure modal container isn't hidden
- Check browser console

## Support
For issues or feature requests, check:
1. Browser console for errors
2. Network tab for API responses
3. MongoDB logs for data persistence
4. Backend server logs for issues
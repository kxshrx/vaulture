# Vaulture Streamlit Prototype

This is a fully functional Streamlit prototype of the Vaulture creators platform that demonstrates all the key features and user flows.

## Features Demonstrated

### For Creators:

- 📊 **Analytics Dashboard**: Revenue tracking, sales metrics, and product performance
- 📦 **Product Management**: View and manage uploaded products
- ⬆️ **Product Upload**: Upload new digital products with title, description, and pricing
- 🛒 **Marketplace View**: Browse all products in the marketplace

### For Buyers:

- 🛒 **Marketplace**: Search and filter products, purchase with one click
- 📦 **Purchase History**: View all purchased products
- ⬇️ **Secure Downloads**: Generate time-limited download links

### General Features:

- 🔐 **Role-based Authentication**: Separate login/registration for creators and buyers
- 🎨 **Modern UI**: Clean, responsive design with custom styling
- 📱 **Interactive Elements**: Real-time updates, charts, and metrics
- 💳 **Simulated Payments**: Mock payment processing for demonstration

## Quick Start

### 1. Install Dependencies

```bash
cd prototype
pip install -r requirements.txt
```

### 2. Run the Prototype

```bash
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

## How to Test

### Test as a Creator:

1. Click "Register" tab
2. Enter any email (e.g., `creator@test.com`)
3. Enter any password
4. Select "Sell digital content"
5. Click "Register"

You'll see the creator dashboard with:

- Analytics showing revenue and sales
- Product management interface
- Upload form for new products
- Marketplace view

### Test as a Buyer:

1. Logout (if logged in as creator)
2. Click "Register" tab
3. Enter a different email (e.g., `buyer@test.com`)
4. Enter any password
5. Select "Buy digital content"
6. Click "Register"

You'll see the buyer interface with:

- Product marketplace with search/filter
- Purchase functionality
- Download center for purchased items

### Demo Users (Login):

- Creator: `creator@example.com` (select "Creator" type)
- Buyer: `buyer@example.com` (select "Buyer" type)
- Artist: `artist@example.com` (select "Creator" type)

## Key UI Components

### Dashboard Cards

- Revenue metrics with gradient backgrounds
- Sales statistics
- Product performance charts

### Product Cards

- Clean product listings
- Purchase buttons with real-time state
- Creator attribution

### Interactive Charts

- Revenue by product (bar chart)
- Sales by product (bar chart)
- Built with Plotly for interactivity

### File Upload Simulation

- Multi-format file support
- Form validation
- Success/error messaging

## Architecture Notes

This prototype simulates the backend API with:

- **Mock Data**: In-memory storage for users, products, and purchases
- **Session State**: Streamlit session state for authentication
- **Real-time Updates**: Immediate UI updates after actions
- **Data Persistence**: Data persists during the session

## Customization

### Styling

- Custom CSS in the main app file
- Gradient cards and modern components
- Responsive design elements

### Data

- Mock data is easily modifiable in `load_mock_data()`
- Add more products, users, or purchases for testing

### Features

- Add new tabs or sections easily
- Extend analytics with more charts
- Add more filtering/search options

## Production Considerations

This prototype demonstrates:

1. **User Experience**: Complete user flows and interactions
2. **UI/UX Design**: Modern, clean interface design
3. **Feature Completeness**: All major features represented
4. **Data Visualization**: Analytics and reporting capabilities

For production, integrate with:

- Real FastAPI backend
- Actual payment processing (Stripe)
- File storage (Supabase)
- Database persistence
- User authentication
- Security measures

## Next Steps

1. **Backend Integration**: Connect to the actual FastAPI backend
2. **Real Authentication**: Implement actual JWT authentication
3. **File Handling**: Real file upload and download functionality
4. **Payment Integration**: Connect to Stripe for real payments
5. **Database**: Replace mock data with real database queries

---

🎨 **Vaulture Prototype** - Showcasing the complete digital content platform experience

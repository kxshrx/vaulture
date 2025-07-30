"""
Utility functions for Vaulture Streamlit Prototype
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import uuid
from config import MOCK_USERS, MOCK_PRODUCTS, MOCK_PURCHASES, UI_CONFIG, ANALYTICS_CONFIG

def get_mock_data():
    """Return mock data for the prototype"""
    return {
        'users': MOCK_USERS.copy(),
        'products': MOCK_PRODUCTS.copy(),
        'purchases': MOCK_PURCHASES.copy()
    }

def format_currency(amount):
    """Format amount as currency"""
    return f"{ANALYTICS_CONFIG['currency_symbol']}{amount:.2f}"

def get_user_by_email(email, users):
    """Find user by email"""
    return next((user for user in users if user['email'] == email), None)

def get_user_by_id(user_id, users):
    """Find user by ID"""
    return next((user for user in users if user['id'] == user_id), None)

def get_product_by_id(product_id, products):
    """Find product by ID"""
    return next((product for product in products if product['id'] == product_id), None)

def get_creator_products(creator_id, products):
    """Get all products for a specific creator"""
    return [product for product in products if product['creator_id'] == creator_id]

def get_user_purchases(user_id, purchases):
    """Get all purchases for a specific user"""
    return [purchase for purchase in purchases if purchase['user_id'] == user_id]

def get_product_purchases(product_id, purchases):
    """Get all purchases for a specific product"""
    return [purchase for purchase in purchases if purchase['product_id'] == product_id]

def calculate_creator_stats(creator_id, products, purchases):
    """Calculate analytics stats for a creator"""
    creator_products = get_creator_products(creator_id, products)
    
    total_products = len(creator_products)
    total_revenue = 0
    total_sales = 0
    
    product_stats = []
    
    for product in creator_products:
        product_purchases = get_product_purchases(product['id'], purchases)
        sales_count = len(product_purchases)
        revenue = sales_count * product['price']
        
        total_sales += sales_count
        total_revenue += revenue
        
        product_stats.append({
            'product_id': product['id'],
            'title': product['title'],
            'price': product['price'],
            'sales': sales_count,
            'revenue': revenue,
            'created_at': product['created_at']
        })
    
    return {
        'total_products': total_products,
        'total_sales': total_sales,
        'total_revenue': total_revenue,
        'product_stats': product_stats
    }

def create_revenue_chart(product_stats):
    """Create revenue chart for creator analytics"""
    if not product_stats:
        return None
    
    df = pd.DataFrame(product_stats)
    fig = px.bar(
        df, 
        x='title', 
        y='revenue',
        title="Revenue by Product",
        color_discrete_sequence=[UI_CONFIG['primary_color']]
    )
    fig.update_layout(
        xaxis_title="Product",
        yaxis_title="Revenue ($)",
        showlegend=False
    )
    return fig

def create_sales_chart(product_stats):
    """Create sales chart for creator analytics"""
    if not product_stats:
        return None
    
    df = pd.DataFrame(product_stats)
    fig = px.bar(
        df, 
        x='title', 
        y='sales',
        title="Sales by Product",
        color_discrete_sequence=[UI_CONFIG['secondary_color']]
    )
    fig.update_layout(
        xaxis_title="Product",
        yaxis_title="Number of Sales",
        showlegend=False
    )
    return fig

def create_revenue_over_time_chart(product_stats, purchases):
    """Create revenue over time chart"""
    if not product_stats:
        return None
    
    # Create daily revenue data
    revenue_data = []
    for stat in product_stats:
        product_purchases = [p for p in purchases if p['product_id'] == stat['product_id']]
        for purchase in product_purchases:
            revenue_data.append({
                'date': purchase['created_at'],
                'revenue': stat['price'],
                'product': stat['title']
            })
    
    if not revenue_data:
        return None
    
    df = pd.DataFrame(revenue_data)
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by date and sum revenue
    daily_revenue = df.groupby('date')['revenue'].sum().reset_index()
    
    fig = px.line(
        daily_revenue,
        x='date',
        y='revenue',
        title="Revenue Over Time",
        color_discrete_sequence=[UI_CONFIG['success_color']]
    )
    fig.update_layout(
        xaxis_title="Date",
        yaxis_title="Daily Revenue ($)",
        showlegend=False
    )
    return fig

def filter_products(products, search_term="", price_filter="All", category_filter="All"):
    """Filter products based on search term, price, and category"""
    filtered_products = products.copy()
    
    # Search filter
    if search_term:
        filtered_products = [
            p for p in filtered_products 
            if search_term.lower() in p['title'].lower() or 
               search_term.lower() in p['description'].lower()
        ]
    
    # Price filter
    if price_filter != "All":
        if price_filter == "Under $10":
            filtered_products = [p for p in filtered_products if p['price'] < 10]
        elif price_filter == "$10-$30":
            filtered_products = [p for p in filtered_products if 10 <= p['price'] <= 30]
        elif price_filter == "$30-$50":
            filtered_products = [p for p in filtered_products if 30 <= p['price'] <= 50]
        elif price_filter == "Over $50":
            filtered_products = [p for p in filtered_products if p['price'] > 50]
    
    # Category filter
    if category_filter != "All":
        filtered_products = [p for p in filtered_products if p.get('category') == category_filter]
    
    return filtered_products

def has_user_purchased_product(user_id, product_id, purchases):
    """Check if user has purchased a specific product"""
    return any(
        p['user_id'] == user_id and p['product_id'] == product_id 
        for p in purchases
    )

def generate_download_link(product_id, file_url):
    """Generate a mock secure download link"""
    token = str(uuid.uuid4())
    return f"https://secure-download.vaulture.com/{file_url}?token={token}&product={product_id}"

def format_date(date_string):
    """Format date string for display"""
    try:
        date_obj = datetime.strptime(date_string, '%Y-%m-%d')
        return date_obj.strftime('%B %d, %Y')
    except:
        return date_string

def display_product_card(product, creator=None, show_purchase_button=False, show_download_button=False, 
                        purchased=False, on_purchase=None, on_download=None):
    """Display a product card with optional buttons"""
    with st.container():
        col1, col2, col3 = st.columns([3, 1, 1])
        
        with col1:
            st.write(f"**{product['title']}**")
            st.write(product['description'])
            if creator:
                st.caption(f"By: {creator['email']}")
            if 'category' in product:
                st.caption(f"Category: {product['category']}")
        
        with col2:
            st.metric("Price", format_currency(product['price']))
        
        with col3:
            if purchased:
                st.success("✅ Purchased")
            elif show_purchase_button and on_purchase:
                if st.button(f"Buy {format_currency(product['price'])}", 
                           key=f"buy_{product['id']}", type="primary"):
                    on_purchase(product['id'])
            
            if show_download_button and on_download:
                if st.button("Download", key=f"download_{product['id']}", type="secondary"):
                    on_download(product['id'])
        
        st.divider()

def display_stats_cards(total_revenue, total_sales, total_products):
    """Display analytics stats cards"""
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, {UI_CONFIG['primary_color']} 0%, {UI_CONFIG['secondary_color']} 100%);
                    color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
            <h3>{format_currency(total_revenue)}</h3>
            <p>Total Revenue</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, {UI_CONFIG['success_color']} 0%, {UI_CONFIG['info_color']} 100%);
                    color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
            <h3>{total_sales}</h3>
            <p>Total Sales</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, {UI_CONFIG['info_color']} 0%, {UI_CONFIG['primary_color']} 100%);
                    color: white; padding: 1.5rem; border-radius: 0.5rem; text-align: center;">
            <h3>{total_products}</h3>
            <p>Products</p>
        </div>
        """, unsafe_allow_html=True)

def get_categories():
    """Get list of product categories"""
    from config import UPLOAD_CONFIG
    return UPLOAD_CONFIG['categories']

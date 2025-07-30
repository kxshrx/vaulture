import streamlit as st
from datetime import datetime
import uuid
from config import APP_CONFIG, UI_CONFIG, UPLOAD_CONFIG, DOWNLOAD_CONFIG
from utils import (
    get_mock_data, format_currency, get_user_by_email, get_user_by_id,
    get_product_by_id, calculate_creator_stats, create_revenue_chart,
    create_sales_chart, filter_products, has_user_purchased_product,
    generate_download_link, format_date, display_product_card,
    display_stats_cards, get_categories
)

# Configure page
st.set_page_config(
    page_title=APP_CONFIG["title"],
    page_icon=APP_CONFIG["icon"],
    layout=APP_CONFIG["layout"],
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown(f"""
<style>
    .main-header {{
        font-size: 3rem;
        font-weight: bold;
        color: #1f1f1f;
        text-align: center;
        margin-bottom: 2rem;
    }}
    .role-badge {{
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: bold;
        margin-left: 1rem;
    }}
    .creator-badge {{
        background-color: {UI_CONFIG['success_color']};
        color: white;
    }}
    .buyer-badge {{
        background-color: {UI_CONFIG['info_color']};
        color: white;
    }}
    .product-card {{
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
        background: white;
    }}
    .stats-card {{
        background: linear-gradient(135deg, {UI_CONFIG['primary_color']} 0%, {UI_CONFIG['secondary_color']} 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        text-align: center;
    }}
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'user' not in st.session_state:
    st.session_state.user = None
if 'mock_data' not in st.session_state:
    st.session_state.mock_data = get_mock_data()

# Authentication functions
def login_user(email, password, is_creator):
    """Mock login function"""
    user = get_user_by_email(email, st.session_state.mock_data['users'])
    if user and user['is_creator'] == is_creator:
        st.session_state.user = user
        return True
    return False

def register_user(email, password, is_creator):
    """Mock registration function"""
    # Check if user already exists
    existing_user = get_user_by_email(email, st.session_state.mock_data['users'])
    if existing_user:
        return False
    
    # Create new user
    new_user = {
        'id': len(st.session_state.mock_data['users']) + 1,
        'email': email,
        'is_creator': is_creator
    }
    st.session_state.mock_data['users'].append(new_user)
    st.session_state.user = new_user
    return True

def purchase_product(product_id):
    """Mock purchase function"""
    new_purchase = {
        'id': len(st.session_state.mock_data['purchases']) + 1,
        'user_id': st.session_state.user['id'],
        'product_id': product_id,
        'created_at': datetime.now().strftime('%Y-%m-%d')
    }
    st.session_state.mock_data['purchases'].append(new_purchase)

def download_product(product_id):
    """Mock download function"""
    product = get_product_by_id(product_id, st.session_state.mock_data['products'])
    if product:
        download_url = generate_download_link(product_id, product['file_url'])
        st.success("✅ Download link generated!")
        st.code(download_url)
        st.caption(f"⏰ Link expires in {DOWNLOAD_CONFIG['link_expiry_seconds']} seconds")

# Header
st.markdown(f'<h1 class="main-header">{APP_CONFIG["icon"]} Vaulture</h1>', unsafe_allow_html=True)
st.markdown(f'<p style="text-align: center; font-size: 1.2rem; color: #6b7280;">{APP_CONFIG["description"]}</p>', unsafe_allow_html=True)

# User status in sidebar
with st.sidebar:
    if st.session_state.user:
        role = "Creator" if st.session_state.user['is_creator'] else "Buyer"
        badge_class = "creator-badge" if st.session_state.user['is_creator'] else "buyer-badge"
        st.markdown(f"""
        <div style="margin-bottom: 1rem;">
            <strong>{st.session_state.user['email']}</strong>
            <span class="role-badge {badge_class}">{role}</span>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("Logout", type="secondary"):
            st.session_state.user = None
            st.rerun()
    else:
        st.info("Please login or register to continue")

# Main content
if st.session_state.user is None:
    # Authentication page
    tab1, tab2 = st.tabs(["Login", "Register"])
    
    with tab1:
        st.subheader("Login")
        with st.form("login_form"):
            email = st.text_input("Email")
            password = st.text_input("Password", type="password")
            user_type = st.radio("I am a:", ["Buyer", "Creator"])
            submitted = st.form_submit_button("Login", type="primary")
            
            if submitted:
                is_creator = user_type == "Creator"
                if login_user(email, password, is_creator):
                    st.success("Login successful!")
                    st.rerun()
                else:
                    st.error("Invalid credentials or user type")
    
    with tab2:
        st.subheader("Register")
        with st.form("register_form"):
            email = st.text_input("Email")
            password = st.text_input("Password", type="password")
            user_type = st.radio("I want to:", ["Buy digital content", "Sell digital content"])
            submitted = st.form_submit_button("Register", type="primary")
            
            if submitted:
                is_creator = user_type == "Sell digital content"
                if register_user(email, password, is_creator):
                    st.success("Registration successful!")
                    st.rerun()
                else:
                    st.error("Email already exists")

else:
    # Main app for logged-in users
    if st.session_state.user['is_creator']:
        # Creator dashboard
        st.header("Creator Dashboard")
        
        # Navigation tabs for creators
        tab1, tab2, tab3, tab4 = st.tabs(["📊 Analytics", "📦 My Products", "⬆️ Upload Product", "🛒 Marketplace"])
        
        with tab1:
            st.subheader("Analytics & Revenue")
            
            # Calculate creator stats
            stats = calculate_creator_stats(
                st.session_state.user['id'],
                st.session_state.mock_data['products'],
                st.session_state.mock_data['purchases']
            )
            
            # Display stats cards
            display_stats_cards(stats['total_revenue'], stats['total_sales'], stats['total_products'])
            
            # Charts
            if stats['product_stats']:
                st.subheader("Product Performance")
                
                col1, col2 = st.columns(2)
                
                with col1:
                    revenue_chart = create_revenue_chart(stats['product_stats'])
                    if revenue_chart:
                        st.plotly_chart(revenue_chart, use_container_width=True)
                
                with col2:
                    sales_chart = create_sales_chart(stats['product_stats'])
                    if sales_chart:
                        st.plotly_chart(sales_chart, use_container_width=True)
                
                # Product breakdown table
                st.subheader("Product Details")
                if stats['product_stats']:
                    import pandas as pd
                    df = pd.DataFrame(stats['product_stats'])
                    df['revenue'] = df['revenue'].apply(format_currency)
                    df['price'] = df['price'].apply(format_currency)
                    df = df[['title', 'price', 'sales', 'revenue']]
                    df.columns = ['Product', 'Price', 'Sales', 'Revenue']
                    st.dataframe(df, use_container_width=True)
            else:
                st.info("Upload some products to see analytics!")
        
        with tab2:
            st.subheader("My Products")
            
            creator_products = [p for p in st.session_state.mock_data['products'] 
                              if p['creator_id'] == st.session_state.user['id']]
            
            if creator_products:
                for product in creator_products:
                    purchases = [p for p in st.session_state.mock_data['purchases'] 
                               if p['product_id'] == product['id']]
                    
                    with st.container():
                        col1, col2, col3, col4 = st.columns([3, 1, 1, 1])
                        with col1:
                            st.write(f"**{product['title']}**")
                            st.write(product['description'])
                            st.caption(f"Created: {format_date(product['created_at'])}")
                        with col2:
                            st.metric("Price", format_currency(product['price']))
                        with col3:
                            st.metric("Sales", len(purchases))
                        with col4:
                            st.metric("Revenue", format_currency(len(purchases) * product['price']))
                    st.divider()
            else:
                st.info("You haven't uploaded any products yet. Use the 'Upload Product' tab to get started!")
        
        with tab3:
            st.subheader("Upload New Product")
            
            with st.form("upload_product"):
                col1, col2 = st.columns([2, 1])
                
                with col1:
                    title = st.text_input("Product Title*", placeholder="e.g., Digital Art Collection")
                    description = st.text_area("Description*", placeholder="Describe your digital product...")
                
                with col2:
                    price = st.number_input("Price ($)*", min_value=0.01, value=9.99, step=0.01)
                    category = st.selectbox("Category", get_categories())
                
                uploaded_file = st.file_uploader(
                    "Upload File*", 
                    type=UPLOAD_CONFIG['allowed_extensions'],
                    help=f"Supported formats: {', '.join(UPLOAD_CONFIG['allowed_extensions'])}"
                )
                
                submitted = st.form_submit_button("Upload Product", type="primary")
                
                if submitted:
                    if title and description and uploaded_file:
                        # Mock file upload
                        file_url = f"{uuid.uuid4()}.{uploaded_file.name.split('.')[-1]}"
                        
                        new_product = {
                            'id': len(st.session_state.mock_data['products']) + 1,
                            'title': title,
                            'description': description,
                            'price': price,
                            'creator_id': st.session_state.user['id'],
                            'file_url': file_url,
                            'created_at': datetime.now().strftime('%Y-%m-%d'),
                            'category': category
                        }
                        
                        st.session_state.mock_data['products'].append(new_product)
                        st.success("Product uploaded successfully!")
                        st.rerun()
                    else:
                        st.error("Please fill in all required fields and upload a file.")
        
        with tab4:
            st.subheader("Browse Marketplace")
            
            # Filters
            col1, col2, col3 = st.columns([2, 1, 1])
            with col1:
                search_term = st.text_input("Search products...", placeholder="Search by title or description")
            with col2:
                price_filter = st.selectbox("Price Range", ["All", "Under $10", "$10-$30", "$30-$50", "Over $50"])
            with col3:
                category_filter = st.selectbox("Category", ["All"] + get_categories())
            
            # Filter products
            filtered_products = filter_products(
                st.session_state.mock_data['products'],
                search_term, price_filter, category_filter
            )
            
            if filtered_products:
                for product in filtered_products:
                    creator = get_user_by_id(product['creator_id'], st.session_state.mock_data['users'])
                    display_product_card(product, creator)
            else:
                st.info("No products found matching your criteria.")
    
    else:
        # Buyer dashboard
        st.header("Buyer Dashboard")
        
        # Navigation tabs for buyers
        tab1, tab2, tab3 = st.tabs(["🛒 Marketplace", "📦 My Purchases", "⬇️ Downloads"])
        
        with tab1:
            st.subheader("Browse Products")
            
            # Search and filter
            col1, col2, col3 = st.columns([2, 1, 1])
            with col1:
                search_term = st.text_input("Search products...", placeholder="Search by title or description")
            with col2:
                price_filter = st.selectbox("Price Range", ["All", "Under $10", "$10-$30", "$30-$50", "Over $50"])
            with col3:
                category_filter = st.selectbox("Category", ["All"] + get_categories())
            
            # Filter products
            filtered_products = filter_products(
                st.session_state.mock_data['products'],
                search_term, price_filter, category_filter
            )
            
            if filtered_products:
                for product in filtered_products:
                    creator = get_user_by_id(product['creator_id'], st.session_state.mock_data['users'])
                    purchased = has_user_purchased_product(
                        st.session_state.user['id'],
                        product['id'],
                        st.session_state.mock_data['purchases']
                    )
                    
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
                            else:
                                if st.button(f"Buy {format_currency(product['price'])}", 
                                           key=f"buy_{product['id']}", type="primary"):
                                    purchase_product(product['id'])
                                    st.success("Purchase successful! 🎉")
                                    st.rerun()
                        st.divider()
            else:
                st.info("No products found matching your criteria.")
        
        with tab2:
            st.subheader("My Purchases")
            
            user_purchases = [p for p in st.session_state.mock_data['purchases'] 
                            if p['user_id'] == st.session_state.user['id']]
            
            if user_purchases:
                for purchase in user_purchases:
                    product = get_product_by_id(purchase['product_id'], st.session_state.mock_data['products'])
                    if product:
                        creator = get_user_by_id(product['creator_id'], st.session_state.mock_data['users'])
                        
                        with st.container():
                            col1, col2, col3 = st.columns([3, 1, 1])
                            with col1:
                                st.write(f"**{product['title']}**")
                                st.write(product['description'])
                                if creator:
                                    st.caption(f"By: {creator['email']}")
                                st.caption(f"Purchased: {format_date(purchase['created_at'])}")
                            with col2:
                                st.metric("Paid", format_currency(product['price']))
                            with col3:
                                if st.button("Download", key=f"download_{product['id']}", type="secondary"):
                                    download_product(product['id'])
                        st.divider()
            else:
                st.info("You haven't purchased any products yet. Browse the marketplace to get started!")
        
        with tab3:
            st.subheader("Download Center")
            
            user_purchases = [p for p in st.session_state.mock_data['purchases'] 
                            if p['user_id'] == st.session_state.user['id']]
            
            if user_purchases:
                st.write("Click on any product below to generate a secure download link:")
                
                for purchase in user_purchases:
                    product = get_product_by_id(purchase['product_id'], st.session_state.mock_data['products'])
                    if product:
                        col1, col2 = st.columns([3, 1])
                        with col1:
                            st.write(f"**{product['title']}**")
                            st.caption(f"File: {product['file_url']}")
                            st.caption(f"Purchased: {format_date(purchase['created_at'])}")
                        with col2:
                            if st.button("Generate Link", key=f"gen_{product['id']}", type="primary"):
                                download_product(product['id'])
            else:
                st.info("No purchased products available for download.")

# Footer
st.markdown("---")
st.markdown(f"""
<div style="text-align: center; color: #6b7280; padding: 2rem;">
    <p>{APP_CONFIG['icon']} Vaulture - {APP_CONFIG['description']}</p>
    <p>Built with Streamlit • Prototype Version</p>
</div>
""", unsafe_allow_html=True)

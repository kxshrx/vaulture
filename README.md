# Creators Platform - Digital Content Platform with Secure File Delivery

A FastAPI-based platform that allows creators to upload digital content and buyers to purchase and securely download files.

## Features

- **Role-based Authentication**: Separate registration for creators and buyers
- **Secure File Storage**: Files stored in Supabase private buckets
- **Payment Processing**: Stripe integration for payments (test mode)
- **Secure Downloads**: Time-limited signed URLs for purchased content
- **Creator Analytics**: Revenue and sales tracking

## Tech Stack

- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (or SQLite for development)
- **Authentication**: JWT with python-jose and passlib
- **File Storage**: Supabase Storage (Private Bucket)
- **Payments**: Stripe (Test Mode)

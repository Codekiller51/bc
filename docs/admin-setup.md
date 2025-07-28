# Admin Setup Guide

## How to Login as Admin

### Step 1: Register a User
1. Go to `/register` in your app
2. Register with these details:
   - **Email**: `admin@brandconnect.co.tz` (or any email you prefer)
   - **Password**: Create a strong password
   - **Name**: `Admin User`
   - **User Type**: Select "Client" (we'll change this to admin)

### Step 2: Update User to Admin
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run this SQL command:

```sql
-- Replace with your actual admin email
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb 
WHERE email = 'admin@brandconnect.co.tz';
```

### Step 3: Login as Admin
1. Go to `/admin/login` in your app
2. Enter your admin credentials:
   - **Email**: The email you registered with
   - **Password**: The password you created

### Step 4: Verify Admin Access
- You should now have access to the admin dashboard at `/admin`
- The system will verify your admin role and grant access

## Default Admin Credentials (for development)

If you want to use default credentials, create a user with:
- **Email**: `admin@brandconnect.co.tz`
- **Password**: `Admin123!@#`
- **Role**: `admin` (set via SQL)

## Troubleshooting

### "Access denied. Admin credentials required."
- Make sure you ran the SQL command to set the role to "admin"
- Check that the email matches exactly

### "Invalid admin credentials"
- Verify the email and password are correct
- Make sure the user exists in auth.users table

### Can't access admin routes
- Ensure you're logging in through `/admin/login` not `/login`
- Check that the user's role is set to "admin" in the database

## Security Notes

- **Change default credentials** in production
- **Use strong passwords** for admin accounts
- **Limit admin access** to trusted personnel only
- **Monitor admin activity** through logs
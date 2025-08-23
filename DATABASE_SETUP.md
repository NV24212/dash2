# Database Setup Instructions

## Fixing Orders Not Receiving Issue

The orders not receiving issue is likely due to Supabase database not being properly configured. Follow these steps to resolve it:

### 1. Supabase Configuration

Make sure you have the following environment variables set in your `.env` file:

```bash
SUPABASE_URL=your_actual_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_actual_supabase_service_role_key
```

**Important:** Replace the placeholder values with your actual Supabase credentials.

### 2. Database Schema Setup

Execute the following SQL script in your Supabase SQL Editor:

```bash
# Copy the content from supabase-complete-setup.sql and run it in Supabase SQL Editor
```

This will create:
- All necessary tables (categories, customers, products, orders, admin_users)
- Proper indexes for performance
- Triggers for automatic updated_at timestamps
- Sample data for testing
- Required permissions and views

### 3. Verify Database Connection

1. Check server logs to ensure Supabase client is initialized successfully
2. Look for this message: `✅ Supabase client initialized successfully`
3. If you see: `⚠️ Supabase not configured. Using fallback in-memory storage.` - your environment variables are not set correctly

### 4. Test Order Creation

1. Try placing a test order through the website
2. Check the orders table in Supabase to confirm orders are being saved
3. Verify in the admin panel that orders appear correctly

### 5. Troubleshooting

If orders are still not appearing:

1. **Check Environment Variables:**
   ```bash
   echo $SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Verify Database Tables:**
   ```sql
   SELECT * FROM orders;
   SELECT * FROM customers;
   ```

3. **Check Server Logs:**
   Look for any Supabase connection errors in the server console

4. **Test API Endpoints:**
   ```bash
   curl -X GET http://localhost:5000/api/orders
   curl -X GET http://localhost:5000/api/customers
   ```

### 6. Fallback Mode

If Supabase is not available, the application automatically falls back to in-memory storage. This means:
- Orders will work temporarily
- Data will be lost on server restart
- Only useful for development/testing

### 7. Production Deployment

For production:
1. Set up proper Supabase project
2. Configure environment variables
3. Run the SQL setup script
4. Enable Row Level Security if needed
5. Set up proper backup procedures

## Common Issues and Solutions

### Issue: "Orders not found" after placing order
**Solution:** Verify customer_id foreign key relationship is working

### Issue: Orders appear but disappear after refresh
**Solution:** Check if Supabase is properly configured vs. using fallback storage

### Issue: Database connection errors
**Solution:** Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct

### Issue: Permission denied errors
**Solution:** Run the GRANT statements from the setup script

## Additional Notes

- The application has been designed with robust fallback support
- All database operations gracefully handle Supabase connection failures
- The fix-characters route now includes more comprehensive pattern matching
- Mobile optimization has been improved across all components
- Order viewing dialog has been completely revamped for better UX

## Contact

If you continue to have issues with orders not being received, check:
1. Server console for error messages
2. Network connectivity to Supabase
3. Database table structure matches the schema
4. Proper environment variable configuration
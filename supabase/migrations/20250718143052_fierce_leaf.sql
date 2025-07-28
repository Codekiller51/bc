@@ .. @@
 -- Enable necessary extensions
 CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
 CREATE EXTENSION IF NOT EXISTS "pgcrypto";
+
+-- Grant necessary permissions for auth schema
+GRANT USAGE ON SCHEMA auth TO anon, authenticated;
+GRANT SELECT ON TABLE auth.users TO anon, authenticated;
 
 -- =============================================
 -- CLIENT PROFILES TABLE
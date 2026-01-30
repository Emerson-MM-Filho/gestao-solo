-- Create Test User for Seed Data
-- Creates a test user account for demo/development purposes
-- Email: test@example.com
-- Password: Test1234!

-- Note: This seed assumes you're running locally with Supabase CLI
-- The password is hashed using pgcrypto extension

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if test user already exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'test@example.com';

  -- Create test user if it doesn't exist
  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'test@example.com',
      crypt('Test1234!', gen_salt('bf')), -- Bcrypt hash
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Test User"}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;

    RAISE NOTICE 'Created test user with ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Test user already exists with ID: %', v_user_id;
  END IF;
END $$;

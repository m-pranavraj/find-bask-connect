-- CRITICAL SECURITY FIX: Move roles to separate table to prevent privilege escalation

-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 4: RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 5: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Drop dependent policies and recreate them with new role system
DROP POLICY IF EXISTS "Admins can update any item" ON public.items;
DROP POLICY IF EXISTS "Admins can delete any item" ON public.items;
DROP POLICY IF EXISTS "Verification requests viewable by involved parties and admins" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins and finders can update verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification docs" ON storage.objects;

-- Recreate policies using has_role function
CREATE POLICY "Admins can update any item"
ON public.items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any item"
ON public.items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Verification requests viewable by involved parties and admins"
ON public.verification_requests
FOR SELECT
TO authenticated
USING (
  auth.uid() = claimant_id 
  OR auth.uid() IN (SELECT finder_id FROM items WHERE items.id = verification_requests.item_id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins and finders can update verification requests"
ON public.verification_requests
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT finder_id FROM items WHERE items.id = verification_requests.item_id)
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can view all verification docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-docs' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Step 7: Now safe to drop role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Step 8: Function to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to assign default role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();
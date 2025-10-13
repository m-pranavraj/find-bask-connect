-- Create organizations table for multi-tenancy
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mall', 'college', 'university', 'hospital', 'airport', 'other')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  radius_meters INTEGER DEFAULT 500, -- Access radius for location verification
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  require_location_verification BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organizations are viewable by everyone
CREATE POLICY "Organizations are viewable by everyone"
ON public.organizations
FOR SELECT
USING (is_active = true);

-- Only admins can manage organizations
CREATE POLICY "Admins can insert organizations"
ON public.organizations
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update organizations"
ON public.organizations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add organization_id to items table
ALTER TABLE public.items
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create index for faster organization filtering
CREATE INDEX idx_items_organization_id ON public.items(organization_id);

-- Create organization_admins table
CREATE TABLE public.organization_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS on organization_admins
ALTER TABLE public.organization_admins ENABLE ROW LEVEL SECURITY;

-- Users can view their own organization admin roles
CREATE POLICY "Users can view their own org admin roles"
ON public.organization_admins
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all organization admins
CREATE POLICY "Admins can view all org admins"
ON public.organization_admins
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage organization admins
CREATE POLICY "Admins can insert org admins"
ON public.organization_admins
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete org admins"
ON public.organization_admins
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check if user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_admins
    WHERE user_id = _user_id
      AND organization_id = _org_id
  ) OR EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Add claimant_phone to verification_requests for SMS notifications
ALTER TABLE public.verification_requests
ADD COLUMN claimant_phone TEXT;

-- Add notification tracking
ALTER TABLE public.verification_requests
ADD COLUMN sms_sent BOOLEAN DEFAULT false,
ADD COLUMN sms_sent_at TIMESTAMPTZ;

-- Update RLS policies for items to include organization filtering
DROP POLICY IF EXISTS "Items are viewable by everyone" ON public.items;

CREATE POLICY "Public items are viewable by everyone"
ON public.items
FOR SELECT
USING (organization_id IS NULL);

CREATE POLICY "Organization items are viewable by members"
ON public.items
FOR SELECT
USING (
  organization_id IS NOT NULL 
  AND (
    is_org_admin(auth.uid(), organization_id)
    OR organization_id IN (
      SELECT organization_id 
      FROM public.items 
      WHERE finder_id = auth.uid()
    )
  )
);

-- Authenticated users can insert items
DROP POLICY IF EXISTS "Authenticated users can insert items" ON public.items;

CREATE POLICY "Users can insert public items"
ON public.items
FOR INSERT
WITH CHECK (auth.uid() = finder_id AND organization_id IS NULL);

CREATE POLICY "Org admins can insert org items"
ON public.items
FOR INSERT
WITH CHECK (
  auth.uid() = finder_id 
  AND organization_id IS NOT NULL
  AND is_org_admin(auth.uid(), organization_id)
);

-- Create trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
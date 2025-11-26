-- Drop the problematic policy
DROP POLICY IF EXISTS "Organization items are viewable by members" ON public.items;

-- Create security definer function to check if user is finder in organization
CREATE OR REPLACE FUNCTION public.is_finder_in_org(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.items
    WHERE finder_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Organization items are viewable by members"
ON public.items
FOR SELECT
USING (
  (organization_id IS NOT NULL) 
  AND (
    is_org_admin(auth.uid(), organization_id) 
    OR is_finder_in_org(auth.uid(), organization_id)
  )
);
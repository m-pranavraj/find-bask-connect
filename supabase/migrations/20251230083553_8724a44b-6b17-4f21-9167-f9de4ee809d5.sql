-- Enable realtime for items table
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;

-- Enable realtime for verification_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_requests;

-- Enable realtime for organizations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;

-- Enable realtime for organization_admins table
ALTER PUBLICATION supabase_realtime ADD TABLE public.organization_admins;
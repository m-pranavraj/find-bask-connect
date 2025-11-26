import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";

const MyClaims = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      loadRequests();
    }
  }, [user, loading]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          items(id, title, image_urls, category, status)
        `)
        .eq('claimant_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading claims",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "My Claims",
    "description": "Verification requests you have submitted to claim lost items.",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Claims - Track Your Lost Item Verification Requests"
        description="View the status of your verification requests for claimed lost items and see when finders approve or reject your claims."
        keywords="my claims, verification requests, lost and found claims, claim status"
        structuredData={structuredData}
      />
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">My Claims</h1>
            <p className="text-muted-foreground mt-2">
              All the verification requests you have submitted to claim items.
            </p>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-lg font-medium mb-2">No claims yet</p>
              <p className="text-muted-foreground mb-4">
                When you submit a verification form for an item, it will appear here.
              </p>
              <a href="/search">
                <Button className="btn-hero">Search Lost Items</Button>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="glass-card rounded-xl p-4 md:p-6 flex gap-4">
                  <img
                    src={req.items?.image_urls?.[0] || '/placeholder.svg'}
                    alt={req.items?.title || 'Claimed item'}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold">
                          {req.items?.title || 'Item'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Submitted on {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            req.status === 'pending'
                              ? 'default'
                              : req.status === 'approved'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {req.status}
                        </Badge>
                      </div>
                    </div>

                    {req.admin_notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Finder Notes</p>
                        <p className="text-sm text-muted-foreground">{req.admin_notes}</p>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Current item status: {req.items?.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyClaims;

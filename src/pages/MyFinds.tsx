import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const MyFinds = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      loadMyFinds();
      loadVerificationRequests();
    }
  }, [user, loading]);

  const loadMyFinds = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('finder_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadVerificationRequests = async () => {
    try {
      // First get all items found by the current user
      const { data: userItems, error: itemsError } = await supabase
        .from('items')
        .select('id')
        .eq('finder_id', user?.id);

      if (itemsError) throw itemsError;

      const itemIds = userItems?.map(item => item.id) || [];

      if (itemIds.length === 0) {
        setVerificationRequests([]);
        return;
      }

      // Then get verification requests for those items
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          items!inner(id, title, image_urls, category, finder_id),
          profiles!verification_requests_claimant_id_fkey(full_name, phone)
        `)
        .in('item_id', itemIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerificationRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading verification requests",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleVerificationAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({
          status: action,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (action === 'approved') {
        const request = verificationRequests.find(r => r.id === requestId);
        if (request) {
          // Update item status
          await supabase
            .from('items')
            .update({ status: 'returned' })
            .eq('id', request.item_id);

          // Send SMS notification
          if (request.claimant_phone) {
            await supabase.functions.invoke('send-sms-notification', {
              body: {
                phone: request.claimant_phone,
                itemTitle: request.items.title,
                status: 'approved'
              }
            });
          }
        }
      }

      toast({
        title: action === 'approved' ? "Claim Approved" : "Claim Rejected",
        description: action === 'approved' 
          ? "SMS notification sent to claimant" 
          : "Claimant has been notified",
      });

      setSelectedRequest(null);
      setAdminNotes("");
      loadVerificationRequests();
      loadMyFinds();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8">My Finds</h1>

          <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="items">Items I Found ({items.length})</TabsTrigger>
              <TabsTrigger value="claims">
                Verification Requests ({verificationRequests.filter(r => r.status === 'pending').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Card key={item.id} className="glass-card p-4 space-y-4">
                    <img
                      src={item.image_urls[0] || '/placeholder.svg'}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/item/${item.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="claims" className="space-y-4">
              {verificationRequests.map((request) => (
                <Card key={request.id} className="glass-card p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={request.items.image_urls[0] || '/placeholder.svg'}
                      alt={request.items.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{request.items.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Claimed by: {request.profiles?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          request.status === 'pending' ? 'default' :
                          request.status === 'approved' ? 'default' : 'secondary'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            className="gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Review Claim
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
            <DialogDescription>
              Review the claimant's proof and decide whether to approve or reject
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Item Details</h3>
                <p>{selectedRequest.items.title}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Claimant Information</h3>
                <p>Name: {selectedRequest.profiles?.full_name}</p>
                <p>Phone: {selectedRequest.profiles?.phone || 'Not provided'}</p>
              </div>

              {selectedRequest.purchase_proof_url && (
                <div>
                  <h3 className="font-semibold mb-2">Purchase Proof</h3>
                  <a
                    href={selectedRequest.purchase_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Document
                  </a>
                </div>
              )}

              {selectedRequest.identification_marks && (
                <div>
                  <h3 className="font-semibold mb-2">Identification Marks</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.identification_marks}
                  </p>
                </div>
              )}

              {selectedRequest.photo_with_item_urls?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Photos with Item</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRequest.photo_with_item_urls.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Proof ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.security_answers && (
                <div>
                  <h3 className="font-semibold mb-2">Security Answers</h3>
                  <div className="space-y-1 text-sm">
                    <p>Purchase Date: {selectedRequest.security_answers.purchaseDate}</p>
                    <p>Purchase Location: {selectedRequest.security_answers.purchaseLocation}</p>
                    <p>Details: {selectedRequest.security_answers.specificDetails}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Admin Notes (Optional)</h3>
                <Textarea
                  placeholder="Add notes about this verification..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleVerificationAction(selectedRequest.id, 'rejected')}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerificationAction(selectedRequest.id, 'approved')}
                  disabled={isSubmitting}
                  className="gap-2 btn-hero"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve & Send SMS
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MyFinds;

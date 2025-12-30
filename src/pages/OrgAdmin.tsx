import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Package,
  Users,
  Shield,
  Building2,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import SEO from '@/components/SEO';

const OrgAdmin = () => {
  const { orgId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, pendingVerifications: 0, admins: 0 });
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOrgData = useCallback(async () => {
    if (!user || !orgId) return;

    setIsLoading(true);
    try {
      // Check if user is org admin
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_org_admin', { _user_id: user.id, _org_id: orgId });

      if (adminError) throw adminError;
      
      if (!adminCheck) {
        toast({
          title: 'Access Denied',
          description: 'You are not an admin for this organization.',
          variant: 'destructive',
        });
        navigate('/organizations');
        return;
      }
      
      setIsOrgAdmin(true);

      // Load organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*, profiles(full_name, phone)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Load verification requests for org items
      const itemIds = itemsData?.map((i) => i.id) || [];
      let verificationsData: any[] = [];
      if (itemIds.length > 0) {
        const { data, error: verificationsError } = await supabase
          .from('verification_requests')
          .select('*, items(id, title, image_urls), profiles!verification_requests_claimant_id_fkey(full_name, phone)')
          .in('item_id', itemIds)
          .order('created_at', { ascending: false });

        if (verificationsError) throw verificationsError;
        verificationsData = data || [];
        setVerifications(verificationsData);
      } else {
        setVerifications([]);
      }

      // Load org admins
      const { data: adminsData, error: adminsError } = await supabase
        .from('organization_admins')
        .select('*, profiles:user_id(full_name, phone)')
        .eq('organization_id', orgId);

      if (adminsError) throw adminsError;
      setAdmins(adminsData || []);

      // Update stats
      setStats({
        totalItems: itemsData?.length || 0,
        pendingVerifications: verificationsData.filter((v: any) => v.status === 'pending').length,
        admins: adminsData?.length || 0,
      });
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, orgId, navigate]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user && orgId) {
      loadOrgData();
    }
  }, [user, loading, orgId, loadOrgData, navigate]);

  // Real-time subscription for items
  useRealtimeSubscription({
    table: 'items',
    filter: `organization_id=eq.${orgId}`,
    enabled: !!orgId && isOrgAdmin,
    onChange: () => loadOrgData(),
  });

  // Real-time subscription for verification requests
  useRealtimeSubscription({
    table: 'verification_requests',
    enabled: !!orgId && isOrgAdmin,
    onChange: () => loadOrgData(),
  });

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;

    try {
      const { error } = await supabase.from('items').delete().eq('id', deleteItemId);

      if (error) throw error;

      toast({
        title: 'Item deleted',
        description: 'The item has been successfully deleted.',
      });

      setItems(items.filter((item) => item.id !== deleteItemId));
      setDeleteItemId(null);
    } catch (error: any) {
      toast({
        title: 'Error deleting item',
        description: error.message,
        variant: 'destructive',
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (action === 'approved') {
        const request = verifications.find((r) => r.id === requestId);
        if (request) {
          await supabase.from('items').update({ status: 'returned' }).eq('id', request.item_id);

          if (request.claimant_phone) {
            await supabase.functions.invoke('send-sms-notification', {
              body: {
                phone: request.claimant_phone,
                itemTitle: request.items.title,
                status: 'approved',
              },
            });
          }
        }
      }

      toast({
        title: action === 'approved' ? 'Claim Approved' : 'Claim Rejected',
        description: action === 'approved' ? 'SMS notification sent to claimant' : 'Claimant has been notified',
      });

      setSelectedRequest(null);
      setAdminNotes('');
      loadOrgData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      available: 'default',
      claimed: 'secondary',
      returned: 'outline',
      pending: 'default',
      approved: 'default',
      rejected: 'destructive',
    };

    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isOrgAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${organization?.name || 'Organization'} Admin Dashboard`}
        description="Manage your organization's lost and found items, verification requests, and team members."
        keywords="organization admin, lost and found management, verification requests"
      />
      <Navigation />

      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{organization?.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {organization?.city}
                  {organization?.is_verified && (
                    <Badge className="bg-green-500 ml-2">Verified</Badge>
                  )}
                </p>
              </div>
            </div>
            <Button onClick={() => loadOrgData()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.admins}</div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="items" className="space-y-4">
            <TabsList>
              <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
              <TabsTrigger value="verifications">
                Verifications ({verifications.filter((v) => v.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="team">Team ({admins.length})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Items</CardTitle>
                  <CardDescription>Manage items posted for your organization</CardDescription>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No items posted yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Posted By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>{item.profiles?.full_name}</TableCell>
                            <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/item/${item.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteItemId(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Requests</CardTitle>
                  <CardDescription>Review and approve/reject verification requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {verifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No verification requests</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Claimant</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verifications.map((verification) => (
                          <TableRow key={verification.id}>
                            <TableCell className="font-medium">{verification.items?.title}</TableCell>
                            <TableCell>{verification.profiles?.full_name}</TableCell>
                            <TableCell>{getStatusBadge(verification.status)}</TableCell>
                            <TableCell>{new Date(verification.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {verification.status === 'pending' && (
                                <Button size="sm" onClick={() => setSelectedRequest(verification)}>
                                  Review
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Organization administrators</CardDescription>
                </CardHeader>
                <CardContent>
                  {admins.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No team members</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Added</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-medium">{admin.profiles?.full_name}</TableCell>
                            <TableCell>
                              <Badge>{admin.role}</Badge>
                            </TableCell>
                            <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>View organization details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Organization Name</Label>
                      <Input value={organization?.name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Input value={organization?.type || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input value={organization?.address || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={organization?.city || ''} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{organization?.contact_email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{organization?.contact_phone}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Access Radius</Label>
                      <Input value={`${organization?.radius_meters || 500} meters`} disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Delete Item Dialog */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review Verification Dialog */}
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
                <p>{selectedRequest.items?.title}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Claimant Information</h3>
                <p>Name: {selectedRequest.profiles?.full_name}</p>
                <p>Phone: {selectedRequest.claimant_phone || selectedRequest.profiles?.phone || 'Not provided'}</p>
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
                  <p className="text-sm text-muted-foreground">{selectedRequest.identification_marks}</p>
                </div>
              )}

              {selectedRequest.photo_with_item_urls?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Photos with Item</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRequest.photo_with_item_urls.map((url: string, idx: number) => (
                      <img key={idx} src={url} alt={`Proof ${idx + 1}`} className="w-full h-24 object-cover rounded" />
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
    </div>
  );
};

export default OrgAdmin;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Trash2, Eye, CheckCircle, XCircle, Package, Users, MessageSquare, Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, totalUsers: 0, pendingVerifications: 0 });
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*, profiles(full_name, phone)')
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Load verification requests
      const { data: verificationsData, error: verificationsError } = await supabase
        .from('verification_requests')
        .select('*, items(title), profiles!verification_requests_claimant_id_fkey(full_name)')
        .order('created_at', { ascending: false });

      if (verificationsError) throw verificationsError;
      setVerifications(verificationsData || []);

      // Update stats
      setStats({
        totalItems: itemsData?.length || 0,
        totalUsers: usersData?.length || 0,
        pendingVerifications: verificationsData?.filter(v => v.status === 'pending').length || 0
      });
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', deleteItemId);

      if (error) throw error;

      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted.",
      });

      setItems(items.filter(item => item.id !== deleteItemId));
      setDeleteItemId(null);
      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleVerificationAction = async (verificationId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({ status })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? "Verification approved" : "Verification rejected",
        description: `The verification request has been ${status}.`,
      });

      loadAdminData();
    } catch (error: any) {
      toast({
        title: "Error updating verification",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      available: 'default',
      claimed: 'secondary',
      returned: 'outline',
      pending: 'default',
      approved: 'default',
      rejected: 'destructive'
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

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your Find & Bask platform</p>
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
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
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
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="items" className="space-y-4">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="verifications">Verifications</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Items</CardTitle>
                  <CardDescription>View and manage all posted items</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
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
                          <TableCell>{item.city}</TableCell>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Users</CardTitle>
                  <CardDescription>View all registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Items Found</TableHead>
                        <TableHead>Items Claimed</TableHead>
                        <TableHead>Reputation</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(user.role)}</TableCell>
                          <TableCell>{user.items_found}</TableCell>
                          <TableCell>{user.items_claimed}</TableCell>
                          <TableCell>{user.reputation_score}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Verifications</CardTitle>
                  <CardDescription>Review and approve/reject verification requests</CardDescription>
                </CardHeader>
                <CardContent>
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
                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleVerificationAction(verification.id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleVerificationAction(verification.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RoleBadge } from '@/components/forum/RoleBadge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface UserWithRole {
  user_id: string;
  full_name: string;
  email?: string;
  role?: AppRole;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ users: 0, posts: 0, comments: 0 });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    if (isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin, roleLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    // Fetch user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.user_id);
      return {
        ...profile,
        role: userRole?.role as AppRole | undefined,
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const fetchStats = async () => {
    const [usersRes, postsRes, commentsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
      supabase.from('forum_comments').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      users: usersRes.count || 0,
      posts: postsRes.count || 0,
      comments: commentsRes.count || 0,
    });
  };

  const handleRoleChange = async (userId: string, newRole: AppRole | 'none') => {
    try {
      if (newRole === 'none') {
        // Remove role
        await supabase.from('user_roles').delete().eq('user_id', userId);
      } else {
        // Check if user already has a role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingRole) {
          // Update existing role
          await supabase
            .from('user_roles')
            .update({ role: newRole })
            .eq('user_id', userId);
        } else {
          // Insert new role
          await supabase.from('user_roles').insert({ user_id: userId, role: newRole });
        }
      }

      toast({ title: t('admin.roleUpdated') });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.users}</div>
            <div className="text-xs text-muted-foreground">{t('admin.totalUsers')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.posts}</div>
            <div className="text-xs text-muted-foreground">{t('admin.totalPosts')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{stats.comments}</div>
            <div className="text-xs text-muted-foreground">{t('admin.totalComments')}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.manageUsers')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.searchUsers')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <Skeleton className="h-48" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.name')}</TableHead>
                    <TableHead>{t('admin.currentRole')}</TableHead>
                    <TableHead>{t('admin.assignRole')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>
                        {user.role ? (
                          <RoleBadge role={user.role} />
                        ) : (
                          <span className="text-muted-foreground text-sm">No role</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role || 'none'}
                          onValueChange={(value) =>
                            handleRoleChange(user.user_id, value as AppRole | 'none')
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No role</SelectItem>
                            <SelectItem value="farmer">Farmer</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

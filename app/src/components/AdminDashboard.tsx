import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, FileText, TrendingUp, Shield } from "lucide-react";
import Layout from "./Layout";

export default function AdminDashboard() {
  const { userDetails } = useAuthContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFeedback: 0,
    totalLegislation: 0,
    pendingModeration: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      // TODO: Implement admin stats API calls
      // For now, using mock data
      setStats({
        totalUsers: 0,
        totalFeedback: 0,
        totalLegislation: 0,
        pendingModeration: 0
      });
    } catch (error) {
      console.error("Error loading admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading admin dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome, {userDetails?.email}! Manage platform activity and moderation.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Registered community members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Community contributions submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Legislation Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalLegislation}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Active legislative proposals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">{stats.pendingModeration}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Items requiring review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Content Moderation
                </CardTitle>
                <CardDescription>
                  Review and moderate user-submitted feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  View Moderation Queue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Manage Legislation
                </CardTitle>
                <CardDescription>
                  Add, edit, or archive legislative items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  Manage Legislation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  View Users
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  View platform engagement and activity metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">
              This admin dashboard is currently under development. Full administrative
              features including content moderation, user management, and analytics will
              be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

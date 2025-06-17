import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Calendar, ExternalLink } from "lucide-react";
import { feedbackServiceGetUserFeedback } from "@/lib/sdk";
import Layout from "./Layout";

interface UserFeedbackItem {
  id: string;
  content: string;
  user_id: string;
  legislative_item_id: string;
  status: string;
  created_at: string;
  vote_count: number;
  legislative_title: string;
}

export default function UserDashboard() {
  const { userDetails } = useAuthContext();
  const [feedback, setFeedback] = useState<UserFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserFeedback();
  }, []);

  const loadUserFeedback = async () => {
    try {
      const response = await feedbackServiceGetUserFeedback();
      if (response.data) {
        setFeedback(response.data as UserFeedbackItem[]);
      }
    } catch (error) {
      console.error("Error loading user feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-800";
      case "hidden": return "bg-yellow-100 text-yellow-800";
      case "deleted": return "bg-red-100 text-red-800";
      case "pending": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalVotes = feedback.reduce((sum, item) => sum + item.vote_count, 0);
  const approvedFeedback = feedback.filter(item => item.status === "approved");

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading your feedback...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userDetails?.email}! Here's your feedback activity and impact.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{feedback.length}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {approvedFeedback.length} approved, {feedback.length - approvedFeedback.length} pending/moderated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Votes Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">{totalVotes}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Community appreciation for your insights
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Impact Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <span className="text-2xl font-bold text-gray-900">
                  {feedback.length > 0 ? Math.round(totalVotes / feedback.length * 10) / 10 : 0}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Average votes per feedback
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Feedback History</h2>
          
          {feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.map((item) => (
                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          <Link 
                            to={`/legislation/${item.legislative_item_id}`}
                            className="hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            {item.legislative_title}
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Heart className="w-4 h-4" />
                            <span>{item.vote_count} votes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap line-clamp-4">
                      {item.content}
                    </p>
                    {item.content.length > 300 && (
                      <Link 
                        to={`/legislation/${item.legislative_item_id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                      >
                        Read full feedback on legislation page →
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback yet</h3>
                <p className="text-gray-600 mb-6">
                  Start engaging with legislation to see your feedback history here.
                </p>
                <Link to="/legislation">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Browse Legislation
                  </button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
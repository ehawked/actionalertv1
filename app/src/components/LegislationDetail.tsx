import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthContext } from "@/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowLeft, User, Calendar, FileText, MessageSquare } from "lucide-react";
import { 
  legislationServiceGetLegislativeItem,
  feedbackServiceGetFeedbackForItem,
  feedbackServiceSubmitFeedback,
  votingServiceToggleVote,
  votingServiceGetUserVotes
} from "@/lib/sdk";
import type { LegislativeItem } from "@/lib/sdk";
import Layout from "./Layout";

interface FeedbackItem {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  legislative_item_id: string;
  status: string;
  created_at: string;
  vote_count: number;
}

export default function LegislationDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, login } = useAuthContext();
  
  const [item, setItem] = useState<LegislativeItem | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [newFeedback, setNewFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadLegislationDetail();
      loadFeedback();
    }
  }, [id]);

  useEffect(() => {
    loadFeedback();
  }, [sortBy]);

  useEffect(() => {
    if (isLoggedIn && feedback.length > 0) {
      loadUserVotes();
    }
  }, [isLoggedIn, feedback]);

  const loadLegislationDetail = async () => {
    try {
      const response = await legislationServiceGetLegislativeItem({
        body: { item_id: id! }
      });
      if (response.data) {
        setItem(response.data);
      }
    } catch (error) {
      console.error("Error loading legislation detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async () => {
    if (!id) return;
    
    setLoadingFeedback(true);
    try {
      const response = await feedbackServiceGetFeedbackForItem({
        body: { 
          legislative_item_id: id,
          sort_by: sortBy
        }
      });
      if (response.data) {
        setFeedback(response.data as FeedbackItem[]);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const loadUserVotes = async () => {
    try {
      const feedbackIds = feedback.map(f => f.id);
      const response = await votingServiceGetUserVotes({
        body: { feedback_ids: feedbackIds }
      });
      if (response.data) {
        setUserVotes(response.data as Record<string, boolean>);
      }
    } catch (error) {
      console.error("Error loading user votes:", error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim() || !id) return;

    setSubmittingFeedback(true);
    try {
      const response = await feedbackServiceSubmitFeedback({
        body: {
          legislative_item_id: id,
          content: newFeedback.trim()
        }
      });
      
      if (response.data) {
        setNewFeedback("");
        setShowFeedbackForm(false);
        loadFeedback(); // Reload feedback to show the new submission
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleToggleVote = async (feedbackId: string) => {
    if (!isLoggedIn) {
      login();
      return;
    }

    try {
      const response = await votingServiceToggleVote({
        body: { feedback_id: feedbackId }
      });
      
      if (response.data) {
        const result = response.data as { voted: boolean; vote_count: number };
        
        // Update the user votes state
        setUserVotes(prev => ({
          ...prev,
          [feedbackId]: result.voted
        }));
        
        // Update the feedback vote count
        setFeedback(prev => prev.map(item => 
          item.id === feedbackId 
            ? { ...item, vote_count: result.vote_count }
            : item
        ));
      }
    } catch (error) {
      console.error("Error toggling vote:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "proposed": return "bg-blue-100 text-blue-800";
      case "in_committee": return "bg-yellow-100 text-yellow-800";
      case "passed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRemainingChars = () => {
    return 1000 - newFeedback.length;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading legislation...</div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Legislation Not Found</h1>
          <p className="text-gray-600 mb-6">The requested legislation could not be found.</p>
          <Link to="/legislation">
            <Button>Back to Legislation</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Back Navigation */}
        <Link 
          to="/legislation"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Legislation
        </Link>

        {/* Legislation Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <Badge className={getStatusColor(item.status)}>
                {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              {item.bill_number && (
                <span className="text-sm text-gray-500 font-mono">
                  {item.bill_number}
                </span>
              )}
            </div>
            <CardTitle className="text-2xl">{item.title}</CardTitle>
            <CardDescription className="text-lg">{item.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Author: {item.author}</span>
                </div>
                {item.category && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Category: {item.category}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(item.created_at || "")}</span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Description</h3>
                <div className="whitespace-pre-wrap text-gray-700">
                  {item.full_description}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Community Feedback ({feedback.length})
            </h2>
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="most_votes">Most Upvoted</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
              {isLoggedIn && (
                <Button 
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  variant={showFeedbackForm ? "outline" : "default"}
                >
                  {showFeedbackForm ? "Cancel" : "Add Feedback"}
                </Button>
              )}
            </div>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <Card>
              <CardHeader>
                <CardTitle>Share Your Feedback</CardTitle>
                <CardDescription>
                  What are your thoughts on this legislation? Be constructive and respectful.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter your feedback here..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="min-h-32"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Be thoughtful and constructive in your feedback</span>
                    <span className={getRemainingChars() < 100 ? "text-red-500" : ""}>
                      {getRemainingChars()} characters remaining
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitFeedback}
                    disabled={!newFeedback.trim() || submittingFeedback}
                  >
                    {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sign in prompt for anonymous users */}
          {!isLoggedIn && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-blue-800 mb-4">
                    Sign in to submit feedback and vote on comments from other students.
                  </p>
                  <Button onClick={login}>Sign In to Participate</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback List */}
          {loadingFeedback ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading feedback...</div>
            </div>
          ) : feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.map((feedbackItem) => (
                <Card key={feedbackItem.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User className="w-4 h-4" />
                          <span>{feedbackItem.user_email}</span>
                          <span>•</span>
                          <span>{formatDate(feedbackItem.created_at)}</span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {feedbackItem.content}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant={userVotes[feedbackItem.id] ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleVote(feedbackItem.id)}
                          className="flex items-center gap-1"
                        >
                          <Heart className={`w-4 h-4 ${userVotes[feedbackItem.id] ? "fill-current" : ""}`} />
                          {feedbackItem.vote_count}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No feedback yet</p>
                <p className="text-gray-500">Be the first to share your thoughts on this legislation!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
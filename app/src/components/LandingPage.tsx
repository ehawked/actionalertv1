import { useAuthContext } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Vote, Shield } from "lucide-react";
import Layout from "./Layout";

export default function LandingPage() {
  const { login } = useAuthContext();

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Your Voice in <span className="text-blue-600">Policy Making</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Join thousands of students in shaping the future. Provide feedback on legislative proposals 
          and vote on the most impactful commentary from your peers.
        </p>
        <Button 
          size="lg" 
          className="text-lg px-8 py-3"
          onClick={login}
        >
          Get Started Today
        </Button>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Share Your Perspective</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Read legislative proposals and submit your thoughtful feedback 
                on policies that matter to you.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Vote className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Vote on Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover insights from other students and upvote the most 
                resonant commentary to amplify important voices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Build Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with fellow students who care about policy and 
                create a stronger collective voice.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <CardTitle>Safe Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Engage in respectful dialogue with moderation tools 
                ensuring constructive and meaningful discussions.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Make Your Voice Heard?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join our community of engaged students and start participating in the democratic process. 
          Your opinion matters, and together we can shape better policies.
        </p>
        <Button 
          size="lg"
          onClick={login}
        >
          Sign Up Now
        </Button>
      </div>
    </Layout>
  );
}
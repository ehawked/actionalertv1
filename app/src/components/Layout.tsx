import { useAuthContext } from "@/auth/AuthProvider";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, Settings } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isLoggedIn, userDetails, login, logout } = useAuthContext();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Main Nav */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-blue-600">
                PolicyFeedback
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link 
                  to="/legislation" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Legislation
                </Link>
                {isLoggedIn && (
                  <Link 
                    to="/dashboard" 
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    My Feedback
                  </Link>
                )}
              </nav>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{userDetails?.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={logout}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm"
                  onClick={login}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 PolicyFeedback. Empowering student voices in democracy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
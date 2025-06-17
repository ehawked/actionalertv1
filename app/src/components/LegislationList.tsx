import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, User, FileText } from "lucide-react";
import { legislationServiceGetLegislativeItems } from "@/lib/sdk";
import type { LegislativeItem } from "@/lib/sdk";
import Layout from "./Layout";

export default function LegislationList() {
  const [items, setItems] = useState<LegislativeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LegislativeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadLegislation();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter, categoryFilter]);

  const loadLegislation = async () => {
    try {
      const response = await legislationServiceGetLegislativeItems();
      if (response.data) {
        setItems(response.data);
      }
    } catch (error) {
      console.error("Error loading legislation:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
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

  // Get unique categories and statuses for filters
  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));
  const statuses = Array.from(new Set(items.map(item => item.status)));

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading legislation...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Current Legislation</h1>
          <p className="text-gray-600 mt-2">
            Explore legislative proposals and share your feedback to help shape policy decisions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search legislation by title, summary, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category || ""}>
                  {category?.replace(/\b\w/g, l => l.toUpperCase()) || "Uncategorized"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} items
        </div>

        {/* Legislation Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  {item.bill_number && (
                    <span className="text-sm text-gray-500 font-mono">
                      {item.bill_number}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">
                  <Link 
                    to={`/legislation/${item.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {item.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {item.summary}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
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
                <Link 
                  to={`/legislation/${item.id}`}
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read Details & Provide Feedback →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No legislation found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
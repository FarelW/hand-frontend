"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  PlusCircle,
  Pill,
  BookOpen,
  LayoutDashboard,
  Settings,
  LogOut,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar
} from "@/components/ui/sidebar";
import { getCookie } from "cookies-next";

// IMPORTANT: Use string for IDs if they are UUIDs in your API
interface Therapist {
  ID: string;
  UserID: string;
  User: {
    name: string;
  };
  Specialization: string;
  Location: string;
  AppointmentRate: number;
}

interface Medication {
  id: string;
  name: string;
  stock: number;
  price: number;
  requiresPrescription: boolean;
}

interface Article {
  ID: string;
  Title: string;
  Type: string;
}

export default function AdminDashboard() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: string } | null>(null);

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  // useSidebar is safe here because we are inside <SidebarProvider>
  const { state } = useSidebar();

  useEffect(() => {
    async function fetchData() {
      try {

        const token = getCookie("authToken");
        if (!token) {
          console.error("No authentication token found!");
          return;
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // 1) Fetch therapists
        const therapistsRes = await fetch("http://localhost:8080/api/therapists", { headers });
        const therapistsData = await therapistsRes.json();
        setTherapists(Array.isArray(therapistsData) ? therapistsData : []);

        // 2) Fetch medications
        const medicationsRes = await fetch("http://localhost:8080/api/medications", { headers });
        const medicationsData = await medicationsRes.json();
        setMedications(Array.isArray(medicationsData) ? medicationsData : []);

        // 3) Fetch articles (media)
        const mediaRes = await fetch("http://localhost:8080/api/media", { headers });
        const mediaData = await mediaRes.json();
        setArticles(Array.isArray(mediaData) ? mediaData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  // Navigate to the Add page for the chosen category
  const handleAdd = (category: string) => {
    router.push(`/admin-dashboard/add?category=${category}`);
  };

  // Navigate to the Edit page, using string IDs
  const handleEdit = (id: string, category: string) => {
    router.push(`/admin-dashboard/edit?id=${id}&category=${category}`);
  };

  // Confirm deletion
  const confirmDelete = (id: string, type: string) => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  // Actually delete the item
  const handleDelete = () => {
    console.log(`Deleting ${itemToDelete?.type} with ID: ${itemToDelete?.id}`);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    // After successful deletion, refresh your data
  };

  return (
    <>
      <div className="flex h-screen bg-background w-full">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader className="border-b">
            <div className="flex items-center justify-center p-2">
              {state !== "collapsed" && <h2 className="text-xl font-bold">Admin Portal</h2>}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "overview"}
                  onClick={() => setActiveTab("overview")}
                  tooltip="Dashboard"
                >
                  <LayoutDashboard className="mr-2" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "therapists"}
                  onClick={() => setActiveTab("therapists")}
                  tooltip="Therapists"
                >
                  <Users className="mr-2" />
                  <span>Therapists</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "medications"}
                  onClick={() => setActiveTab("medications")}
                  tooltip="Medications"
                >
                  <Pill className="mr-2" />
                  <span>Medications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "articles"}
                  onClick={() => setActiveTab("articles")}
                  tooltip="Articles & Videos"
                >
                  <BookOpen className="mr-2" />
                  <span>Articles & Videos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings className="mr-2" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logout">
                  <LogOut className="mr-2" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage your platform content and users
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <SidebarTrigger />
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-64 pl-8"
                  />
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="therapists">Therapists</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="articles">Articles & Videos</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Cards for total counts */}
                  <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <CardTitle className="text-sm font-medium">
                        Total Therapists
                      </CardTitle>
                      <Users className="h-4 w-4" />
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold">{therapists.length}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800 hover:bg-transparent"
                        onClick={() => setActiveTab("therapists")}
                      >
                        View all therapists →
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <CardTitle className="text-sm font-medium">Medications</CardTitle>
                      <Pill className="h-4 w-4" />
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold">{medications.length}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-purple-600 hover:text-purple-800 hover:bg-transparent"
                        onClick={() => setActiveTab("medications")}
                      >
                        View all medications →
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                      <CardTitle className="text-sm font-medium">
                        Articles & Videos
                      </CardTitle>
                      <BookOpen className="h-4 w-4" />
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold">{articles.length}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 p-0 h-auto text-amber-600 hover:text-amber-800 hover:bg-transparent"
                        onClick={() => setActiveTab("articles")}
                      >
                        View all content →
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                          onClick={() => handleAdd("Therapist")}
                        >
                          <Users className="h-6 w-6" />
                          <span>Add Therapist</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                          onClick={() => handleAdd("Medications")}
                        >
                          <Pill className="h-6 w-6" />
                          <span>Add Medication</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                          onClick={() => handleAdd("articles")}
                        >
                          <BookOpen className="h-6 w-6" />
                          <span>Add Article</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                            <span>API Services</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">
                            Operational
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                            <span>Database</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">
                            Operational
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                            <span>Storage</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">
                            Operational
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                            <span>Authentication</span>
                          </div>
                          <span className="text-sm text-green-600 font-medium">
                            Operational
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Therapists Tab */}
              <TabsContent value="therapists" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Therapists</h2>
                  <Button
                    onClick={() => handleAdd("Therapist")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Therapist
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {therapists.map((therapist) => (
                          <TableRow key={therapist.ID}>
                            <TableCell className="font-medium">
                              {therapist.User.name}
                            </TableCell>
                            <TableCell>{therapist.Specialization}</TableCell>
                            <TableCell>{therapist.Location}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(therapist.AppointmentRate)}
                              /hr
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEdit(therapist.UserID, "Therapist")
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      confirmDelete(therapist.ID, "Therapist")
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medications Tab */}
              <TabsContent value="medications" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Medications</h2>
                  <Button
                    onClick={() => handleAdd("Medications")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Medication
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Prescription</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medications.map((medication) => (
                          <TableRow key={medication.id}>
                            <TableCell className="font-medium">
                              {medication.name}
                            </TableCell>
                            <TableCell>{medication.stock} units</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(medication.price)}
                            </TableCell>
                            <TableCell>
                              {medication.requiresPrescription ? (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                  Required
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                  Not Required
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEdit(medication.id, "Medications")
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      confirmDelete(medication.id, "Medications")
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Articles & Videos Tab */}
              <TabsContent value="articles" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Articles & Videos</h2>
                  <Button
                    onClick={() => handleAdd("articles")}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Content
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articles.map((article) => (
                          <TableRow key={article.ID}>
                            <TableCell className="font-medium">
                              {article.Title}
                            </TableCell>
                            <TableCell>
                              {article.Type === "article" ? (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                  Article
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                  Video
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(article.ID, "Articles")}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => confirmDelete(article.ID, "Articles")}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

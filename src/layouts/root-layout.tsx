// layouts/RootLayout.tsx
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, Outlet } from "react-router";

export const RootLayout = () => {
    const navLinks = ["Dashboard", "Projects", "Team", "Settings"];

    const SidebarContent = () => (
        <nav className="space-y-2 p-y-1">
            {navLinks.map((link) => (
                <Link
                    key={link}
                    to={`/${link.toLowerCase()}`}
                    className="block rounded-none px-3 py-2 text-sm font-medium hover:bg-accent">
                    {link}
                </Link>
            ))}
        </nav>
    );

    return (
        <div className="flex h-screen flex-col">
            {/* Sticky Navbar */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
                <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        {/* Mobile menu trigger */}
                        <Sheet>
                            <SheetTrigger asChild className="md:hidden">
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-64 p-0">
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>

                        <h1 className="text-lg font-semibold">MyApp</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            Sign out
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden w-64 border-r md:block">
                    <ScrollArea className="h-full">
                        <SidebarContent />
                    </ScrollArea>
                </aside>

                {/* Main Content */}
                <main className="flex flex-1 overflow-hidden">
                    <ScrollArea className="h-full w-full">
                        <Outlet />
                    </ScrollArea>
                </main>
            </div>
        </div>
    );
};

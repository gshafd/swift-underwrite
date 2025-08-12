import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 focus:outline-none">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-accent" />
          <span className="font-semibold">Auto UW AI</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/underwriter">
            <Button variant={isActive('/underwriter') ? 'default' : 'ghost'} size="sm">
              Submissions
            </Button>
          </Link>
          <Link to="/underwriter/queue">
            <Button variant={isActive('/underwriter/queue') ? 'default' : 'ghost'} size="sm">
              AI Processing Queue
            </Button>
          </Link>
          <Link to="/underwriter/reports">
            <Button variant={isActive('/underwriter/reports') ? 'default' : 'ghost'} size="sm">
              Reports
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant={isActive('/settings') ? 'default' : 'ghost'} size="sm">
              Settings
            </Button>
          </Link>
          <Link to="/broker">
            <Button variant={isActive('/broker') ? 'default' : 'ghost'} size="sm">
              Broker Portal
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

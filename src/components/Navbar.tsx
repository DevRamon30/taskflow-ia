import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#funcionalidades" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Funcionalidades
          </a>
          <a href="#como-funciona" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Como Funciona
          </a>
          <a href="#planos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Planos
          </a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/tarefas">
                <Button variant="ghost" size="sm">Minhas Tarefas</Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.user_metadata?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button size="sm" className="bg-hero-gradient text-primary-foreground hover:opacity-90 transition-opacity">
                  Criar Conta
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

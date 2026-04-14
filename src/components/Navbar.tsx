import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const Navbar = () => {
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
          <Link to="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link to="/cadastro">
            <Button size="sm" className="bg-hero-gradient text-primary-foreground hover:opacity-90 transition-opacity">
              Criar Conta
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TaskFlow IA. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">Termos</a>
            <a href="#" className="transition-colors hover:text-foreground">Privacidade</a>
            <a href="#" className="transition-colors hover:text-foreground">Contato</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

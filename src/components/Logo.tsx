import logoImg from "@/assets/logo.png";

const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "h-7", md: "h-9", lg: "h-12" };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" };

  return (
    <div className="flex items-center gap-2">
      <img src={logoImg} alt="TaskFlow IA" className={`${sizes[size]} w-auto`} />
      <span className={`${textSizes[size]} font-bold tracking-tight text-foreground`}>
        Task<span className="text-gradient">Flow</span>{" "}
        <span className="font-light text-muted-foreground">IA</span>
      </span>
    </div>
  );
};

export default Logo;

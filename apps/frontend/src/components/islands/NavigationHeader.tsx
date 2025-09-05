import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/shadcn-ui/navigation-menu";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "ホーム", href: "/" },
  { name: "料金", href: "/pricing" },
  { name: "講師紹介", href: "/instructor" },
  { name: "お問い合わせ", href: "/contact" },
];

export default function NavigationHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const headerClass = cn(
    "fixed w-full top-0 z-50 transition-all duration-300",
    isScrolled ? "bg-white/95 shadow-sm" : "bg-transparent"
  );
  const textClass = cn(
    "text-xl font-serif font-bold transition-colors",
    isScrolled ? "text-primary" : "text-white drop-shadow-lg"
  );
  const linkClass = (isActive: boolean) =>
    cn(
      "inline-flex items-center px-3 py-2 text-sm font-medium transition-colors bg-transparent hover:bg-transparent",
      isActive
        ? isScrolled
          ? "text-primary font-semibold border-b-2 border-primary"
          : "text-white font-semibold border-b-2 border-white"
        : isScrolled
          ? "text-gray-700 hover:text-primary"
          : "text-white/90 hover:text-white"
    );
  const mobileButtonClass = cn(
    "inline-flex items-center justify-center rounded-md p-2 transition-colors md:hidden",
    isScrolled
      ? "text-gray-700 hover:bg-gray-100 hover:text-primary"
      : "text-white hover:bg-white/10"
  );
  return (
    <header className={headerClass}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className={textClass}>どんぐりピアノ教室</span>
            </a>
          </div>
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              {navigation.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    href={item.href}
                    className={linkClass(currentPath === item.href)}
                  >
                    {item.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <button onClick={() => setIsOpen(!isOpen)} className={mobileButtonClass}>
            <span className="sr-only">メニューを開く</span>
            {isOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
        {isOpen && (
          <div className={cn("md:hidden", isScrolled ? "bg-white" : "bg-black/90")}>
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors",
                    currentPath === item.href
                      ? isScrolled
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-white bg-white/10 text-white"
                      : isScrolled
                        ? "border-transparent text-gray-700 hover:border-primary hover:bg-gray-50 hover:text-primary"
                        : "border-transparent text-white/80 hover:border-white hover:bg-white/5 hover:text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

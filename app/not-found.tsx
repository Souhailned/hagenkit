import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold text-muted-foreground/20">404</h1>
      <h2 className="mt-4 text-2xl font-bold">Pagina niet gevonden</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Sorry, de pagina die je zoekt bestaat niet of is verplaatst.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Homepage
          </Button>
        </Link>
        <Link href="/aanbod">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Bekijk aanbod
          </Button>
        </Link>
      </div>
    </div>
  );
}

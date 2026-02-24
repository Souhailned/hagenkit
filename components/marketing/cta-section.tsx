import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <Building2 className="mx-auto h-10 w-10 text-primary-foreground/80 mb-4" />
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
          Klaar om je horecapand te vinden?
        </h2>
        <p className="mt-3 text-lg text-primary-foreground/80 max-w-xl mx-auto">
          Of je nu op zoek bent naar een restaurant of je panden wilt aanbieden — start vandaag nog.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/aanbod">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Bekijk aanbod
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/voor-makelaars">
            <Button size="lg" variant="secondary" className="text-base px-8 bg-primary-foreground/15 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/25">
              Voor makelaars
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

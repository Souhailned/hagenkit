import { getFavorites } from "@/app/actions/favorites";
import { PropertyCard } from "@/components/aanbod/property-card";
import { Heart } from "lucide-react";
import { Property } from "@/types/property";

export const metadata = {
  title: "Favorieten - Horecagrond",
  description: "Je opgeslagen horeca panden",
};

export default async function FavorietenPage() {
  const favorites = await getFavorites();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Favorieten</h1>
        <p className="mt-2 text-muted-foreground">
          Je opgeslagen horeca panden ({favorites.length})
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Geen favorieten</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Klik op het hartje bij een pand om het op te slaan als favoriet.
            Zo kun je makkelijk panden vergelijken.
          </p>
          <a
            href="/aanbod"
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Bekijk aanbod
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <PropertyCard
              key={fav.id}
              property={fav.property as unknown as Property}
              isFavorited
            />
          ))}
        </div>
      )}
    </div>
  );
}

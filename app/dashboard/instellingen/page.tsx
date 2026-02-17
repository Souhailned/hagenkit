import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Trash2, LogOut } from "lucide-react";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";

export default function InstellingenPage() {
  return (
    <ContentCard>
      <ContentCardHeader title="Instellingen" />
      <ContentCardBody className="p-4">
        <div className="mx-auto max-w-2xl space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Meldingen
          </CardTitle>
          <CardDescription>Beheer wanneer en hoe je meldingen ontvangt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">E-mail meldingen</p>
              <p className="text-xs text-muted-foreground">Ontvang updates over je panden en aanvragen</p>
            </div>
            <Button variant="outline" size="sm">Aan</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Zoek alerts</p>
              <p className="text-xs text-muted-foreground">Meldingen bij nieuwe panden die matchen</p>
            </div>
            <Button variant="outline" size="sm">Aan</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Privacy
          </CardTitle>
          <CardDescription>Beheer je privacy instellingen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Profiel zichtbaar</p>
              <p className="text-xs text-muted-foreground">Je profiel is zichtbaar voor andere gebruikers</p>
            </div>
            <Button variant="outline" size="sm">Aan</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <Trash2 className="h-5 w-5" />
            Gevarenzone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Uitloggen</p>
              <p className="text-xs text-muted-foreground">Log uit op dit apparaat</p>
            </div>
            <Button variant="outline" size="sm">
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Uitloggen
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Account verwijderen</p>
              <p className="text-xs text-muted-foreground">Verwijder je account en alle data permanent</p>
            </div>
            <Button variant="destructive" size="sm">Verwijderen</Button>
          </div>
        </CardContent>
      </Card>

        </div>
      </ContentCardBody>
    </ContentCard>
  );
}

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { propertyInquirySchema, type PropertyInquiryInput } from "@/lib/validations/property";
import { createPropertyInquiry } from "@/app/actions/property";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyInquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  className?: string;
}

const INTENDED_USE_OPTIONS = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "bar", label: "Bar" },
  { value: "hotel", label: "Hotel" },
  { value: "dark_kitchen", label: "Dark Kitchen" },
  { value: "nightclub", label: "Nachtclub" },
  { value: "catering", label: "Catering" },
  { value: "other", label: "Anders" },
];

const BUDGET_OPTIONS = [
  { value: 50000, label: "Tot €50.000" },
  { value: 100000, label: "€50.000 - €100.000" },
  { value: 250000, label: "€100.000 - €250.000" },
  { value: 500000, label: "€250.000 - €500.000" },
  { value: 1000000, label: "€500.000 - €1.000.000" },
  { value: 2000000, label: "Meer dan €1.000.000" },
];

export function PropertyInquiryForm({
  propertyId,
  propertyTitle,
  className,
}: PropertyInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<PropertyInquiryInput>({
    resolver: zodResolver(propertyInquirySchema),
    defaultValues: {
      propertyId,
      name: "",
      email: "",
      phone: "",
      message: "",
      conceptDescription: "",
      budget: null,
      intendedUse: "",
    },
  });

  const onSubmit = async (data: PropertyInquiryInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createPropertyInquiry(data);

      if (result.success) {
        setIsSuccess(true);
        form.reset();
      } else {
        setError(result.error || "Er is een fout opgetreden");
      }
    } catch {
      setError("Er is een onverwachte fout opgetreden");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("rounded-2xl bg-card border p-6 text-center", className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Bericht verzonden!
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bedankt voor uw interesse. We nemen zo spoedig mogelijk contact met u op.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsSuccess(false)}
            className="mt-2"
          >
            Nog een bericht versturen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl bg-card border p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Interesse in dit pand?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Laat uw gegevens achter en we nemen contact met u op.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naam *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Uw naam"
                    {...field}
                    className="bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="uw@email.nl"
                    {...field}
                    className="bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefoon</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+31 6 12345678"
                    {...field}
                    className="bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intendedUse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beoogd gebruik</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecteer type horeca" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INTENDED_USE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="conceptDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Uw concept</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Vertel kort over uw horecaconcept..."
                    {...field}
                    className="bg-background resize-none min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecteer budget range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bericht *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Ik ben geïnteresseerd in ${propertyTitle}...`}
                    {...field}
                    className="bg-background resize-none min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Verzenden...
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Verstuur bericht
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Door dit formulier te versturen gaat u akkoord met onze{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              privacyverklaring
            </a>
            .
          </p>
        </form>
      </Form>
    </div>
  );
}

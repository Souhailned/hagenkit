"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  createInquirySchema,
  type CreateInquiryInput,
  CONCEPT_TYPES,
  BUDGET_RANGES,
} from "@/lib/validations/inquiry";
import { createInquiry } from "@/app/actions/inquiries";

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  priceType?: "RENT" | "SALE" | "RENT_OR_SALE";
  prefillData?: {
    name?: string;
    email?: string;
  };
  onSuccess?: () => void;
}

export function InquiryForm({
  propertyId,
  propertyTitle,
  priceType = "RENT",
  prefillData,
  onSuccess,
}: InquiryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<CreateInquiryInput>({
    resolver: zodResolver(createInquirySchema),
    defaultValues: {
      propertyId,
      name: prefillData?.name || "",
      email: prefillData?.email || "",
      phone: "",
      message: "",
      intendedUse: "",
      budget: "",
    },
  });

  const onSubmit = (data: CreateInquiryInput) => {
    startTransition(async () => {
      const result = await createInquiry(data);

      if (result.success) {
        setIsSubmitted(true);
        toast.success("Aanvraag verstuurd!", {
          description: "De makelaar neemt zo snel mogelijk contact met je op.",
        });
        onSuccess?.();
      } else {
        toast.error("Er ging iets mis", {
          description: result.error || "Probeer het opnieuw.",
        });
      }
    });
  };

  // Filter budget ranges based on price type
  const filteredBudgetRanges = BUDGET_RANGES.filter((range) => {
    if (priceType === "SALE") return range.value.startsWith("sale-");
    if (priceType === "RENT") return !range.value.startsWith("sale-");
    return true; // RENT_OR_SALE shows all
  });

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Bedankt voor je interesse!</h3>
        <p className="text-muted-foreground text-sm">
          Je aanvraag voor &ldquo;{propertyTitle}&rdquo; is verstuurd.
          De makelaar neemt binnen 24 uur contact met je op.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Naam *</FormLabel>
              <FormControl>
                <Input placeholder="Je volledige naam" {...field} />
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
                <Input type="email" placeholder="je@email.nl" {...field} />
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
                <Input type="tel" placeholder="+31 6 1234 5678" {...field} />
              </FormControl>
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
                  placeholder="Vertel iets over jezelf en je plannen voor deze locatie..."
                  className="min-h-[100px] resize-none"
                  {...field}
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
              <FormLabel>Wat wil je openen?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONCEPT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget indicatie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredBudgetRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Versturen...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Verstuur Aanvraag
            </>
          )}
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          Door te versturen ga je akkoord met onze{" "}
          <a href="/terms" className="underline hover:text-foreground">
            voorwaarden
          </a>{" "}
          en{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            privacy policy
          </a>
          .
        </p>
      </form>
    </Form>
  );
}

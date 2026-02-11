"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDots, Clock, User, EnvelopeSimple, Phone, PaperPlaneTilt, CheckCircle } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createPropertyInquiry } from "@/app/actions/property";

const viewingSchema = z.object({
  name: z.string().min(2, "Naam is verplicht"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().optional(),
  preferredDate: z.string().min(1, "Kies een datum"),
  preferredTime: z.string().min(1, "Kies een tijdslot"),
  message: z.string().optional(),
});

type ViewingFormData = z.infer<typeof viewingSchema>;

const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "Na 18:00 (overleg)",
];

interface ViewingRequestDialogProps {
  propertyId: string;
  propertyTitle: string;
  children?: React.ReactNode;
}

export function ViewingRequestDialog({
  propertyId,
  propertyTitle,
  children,
}: ViewingRequestDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const form = useForm<ViewingFormData>({
    resolver: zodResolver(viewingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredDate: "",
      preferredTime: "",
      message: "",
    },
  });

  // Generate next 14 days as date options
  const dateOptions = React.useMemo(() => {
    const dates: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
      const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
      const dayName = dayNames[date.getDay()];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const isoDate = date.toISOString().split("T")[0];
      dates.push({
        value: isoDate,
        label: `${dayName} ${day} ${month}`,
      });
    }
    return dates;
  }, []);

  const onSubmit = async (data: ViewingFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createPropertyInquiry({
        propertyId,
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        message: `Bezichtiging aanvragen\n\nVoorkeursdatum: ${data.preferredDate}\nVoorkeurstijd: ${data.preferredTime}\n\n${data.message || "Ik wil graag dit pand bezichtigen."}`,
        intendedUse: "viewing_request",
      });

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setIsSuccess(false);
          form.reset();
        }, 2000);
      }
    } catch (error) {
      console.error("Viewing request failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="lg" className="w-full gap-2">
            <CalendarDots className="h-5 w-5" weight="duotone" />
            Bezichtiging aanvragen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500" weight="duotone" />
            <DialogTitle className="text-center">Aanvraag verstuurd!</DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              De makelaar neemt zo snel mogelijk contact met je op.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDots className="h-5 w-5" weight="duotone" />
                Bezichtiging aanvragen
              </DialogTitle>
              <DialogDescription className="line-clamp-1">
                {propertyTitle}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Naam
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Je volledige naam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <EnvelopeSimple className="h-3.5 w-3.5" />
                          E-mail
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="je@email.nl" {...field} />
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
                        <FormLabel className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          Telefoon
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="06-12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <CalendarDots className="h-3.5 w-3.5" />
                          Datum
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Kies datum" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dateOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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
                    name="preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Tijdslot
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Kies tijd" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opmerking (optioneel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Bijv. specifieke vragen of wensen..."
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Versturen...
                    </>
                  ) : (
                    <>
                      <PaperPlaneTilt className="h-4 w-4" weight="duotone" />
                      Bezichtiging aanvragen
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

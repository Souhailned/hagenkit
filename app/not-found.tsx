"use client";

import Link from "next/link";
import { Question, House } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Empty className="border-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Question />
          </EmptyMedia>
          <div className="text-6xl font-bold text-muted-foreground/20 mb-2">
            404
          </div>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">
              <House className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

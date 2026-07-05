"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground px-2">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

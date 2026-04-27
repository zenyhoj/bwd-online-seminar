"use client";

import { useActionState } from "react";

import { createSeminarItemAction, deleteSeminarItemAction } from "@/actions/seminar";
import { initialActionState } from "@/actions/state";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SeminarItem } from "@/types";

type SeminarItemFormProps = {
  items: SeminarItem[];
};

function DeleteSeminarButton({ seminarItemId }: { seminarItemId: string }) {
  const [state, formAction, pending] = useActionState(deleteSeminarItemAction, initialActionState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="seminarItemId" value={seminarItemId} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Removing..." : "Delete"}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}

export function SeminarItemForm({ items }: SeminarItemFormProps) {
  const [state, formAction, pending] = useActionState(createSeminarItemAction, initialActionState);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add seminar item</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                className="min-h-36 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mediaType">Media type</Label>
              <select
                id="mediaType"
                name="mediaType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="text"
              >
                <option value="text">Text only</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display order</Label>
              <Input id="displayOrder" name="displayOrder" type="number" min={0} defaultValue={items.length} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mediaUrl">Media URL</Label>
              <Input
                id="mediaUrl"
                name="mediaUrl"
                type="url"
                placeholder="Use an image URL or embeddable video URL if needed."
              />
            </div>
            <div className="md:col-span-2">
              <FormMessage state={state} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Add seminar item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current seminar list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No seminar items published yet.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-border/80 p-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Order {item.display_order}</span>
                    <span>{item.media_type}</span>
                    <span>{item.is_active ? "Active" : "Inactive"}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{item.description}</p>
                  {item.media_url ? (
                    <p className="text-xs text-muted-foreground">
                      Media URL: <span className="break-all">{item.media_url}</span>
                    </p>
                  ) : null}
                </div>
                <DeleteSeminarButton seminarItemId={item.id} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

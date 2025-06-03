"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { TaskFormValues, defaultTaskValues, taskFormSchema, useAppForm } from "./form";
import { toTaskRequest, getErrorMessage } from "./utils";

interface TaskFormProps {
  accountId: string;
  categories: { id: string; title: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface GetDefaultValuesOptions {
  categories: { id: string; title: string }[];
}

function getDefaultValues({ categories }: GetDefaultValuesOptions): TaskFormValues {
  return {
    ...defaultTaskValues,
    categoryId: categories.length > 0 ? categories[0]?.id || "" : "",
  };
}

export function TaskForm({ accountId, categories, onSuccess, onCancel }: TaskFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation(
    trpc.tasks.createTask.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.tasks.list.queryKey() });
        onSuccess?.();
      },
    })
  );

  const form = useAppForm({
    defaultValues: getDefaultValues({ categories }),
    validators: {
      onBlur: taskFormSchema,
    },
    onSubmit: async ({ value }) => {
      createTaskMutation.mutate({
        accountId,
        categoryId: value.categoryId,
        task: toTaskRequest(value),
      });
    },
  });

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <SidebarMenuItem className="group/item">
      <div className="relative w-full">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="absolute top-2 right-2 h-6 w-6 p-0 text-neutral-400 hover:text-white z-10"
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </Button>
        <form
          className="flex flex-col mt-2"
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <div className="space-y-2">
            <form.Field name="title">
              {(field) => (
                <div>
                  <Label htmlFor={field.name} className="sr-only">
                    Title
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Title"
                    className="border-none shadow-none rounded-md bg-transparent dark:bg-transparent focus:ring-0 dark:focus:ring-0 placeholder:text-neutral-400"
                    autoFocus
                  />
                  {field.state.meta.errors.length > 0 && (
                    <span className="text-xs text-red-500 mt-1">
                      {getErrorMessage(field.state.meta.errors[0])}
                    </span>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="notes">
              {(field) => (
                <div>
                  <Label htmlFor={field.name} className="sr-only">
                    Description
                  </Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Description"
                    className="border-none shadow-none rounded-md bg-transparent dark:bg-transparent focus:ring-0 dark:focus:ring-0 resize-none min-h-[60px]"
                  />
                </div>
              )}
            </form.Field>

            <div className="flex gap-1">
              <form.Field name="due">
                {(field) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-start text-left font-normal border-none h-auto rounded-full bg-neutral-800"
                      >
                        <CalendarIcon className="size-4" />
                        {field.state.value ? format(field.state.value, "dd MMM") : "Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.state.value}
                        onSelect={(date) => {
                          field.handleChange(date);
                          field.handleBlur();
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </form.Field>

              <form.Field name="categoryId">
                {(field) => (
                  <div className="flex-1">
                    <Label htmlFor={field.name} className="sr-only">
                      Category
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        field.handleBlur();
                      }}
                    >
                      <SelectTrigger className="border-none shadow-none rounded-full bg-neutral-800">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <span className="line-clamp-1">{category.title}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <span className="text-xs text-red-500 mt-1">
                        {getErrorMessage(field.state.meta.errors[0])}
                      </span>
                    )}
                  </div>
                )}
              </form.Field>

              <Button
                type="submit"
                variant="secondary"
                size="icon"
                className="size-8 bg-neutral-600/20 hover:bg-neutral-600 disabled:opacity-50"
                disabled={!form.state.isValid || createTaskMutation.isPending}
              >
                <Plus />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </SidebarMenuItem>
  );
}

export function AddTask({ accountId, categories }: {
  accountId: string;
  categories: { id: string; title: string }[];
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <TaskForm
        accountId={accountId}
        categories={categories}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <SidebarMenuItem className="group/item">
      <SidebarMenuButton
        onClick={() => setIsOpen(true)}
        className="hover:bg-neutral-600/20"
      >
        <div className="relative flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          <span className="line-clamp-1 block select-none">
            Add task
          </span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
  
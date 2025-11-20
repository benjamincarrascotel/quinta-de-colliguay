import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";

interface Action {
  label: string;
  onClick?: () => void;
  variant?: ButtonProps["variant"];
  closesDialog?: boolean;
  type?: "button" | "submit" | "reset";
  form?: string;
  disabled?: boolean;
}

interface MessageDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  actions: Action[];
}

export function MessageDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  actions,
}: MessageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="flex max-h-[90vh] flex-col p-0">
        {/* Fixed header */}
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6">
          <DialogDescription asChild>
            <div className="py-4">{description}</div>
          </DialogDescription>
        </div>

        {/* Fixed footer */}
        <DialogFooter className="shrink-0 px-6 pb-6 pt-4">
          {actions.map((action, index) =>
            action.closesDialog ? (
              <DialogClose key={index} asChild>
                <Button
                  variant={action.variant}
                  onClick={action.onClick}
                  type={action.type}
                  form={action.form}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              </DialogClose>
            ) : (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
                type={action.type}
                form={action.form}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ),
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
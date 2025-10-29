import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleHelp } from 'lucide-react';

interface FormulaDialogProps {
  title: string;
  description: string;
  calculation: ReactNode;
}

export function FormulaDialog({ title, description, calculation }: FormulaDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <CircleHelp className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {typeof calculation === 'string' ? <p>{calculation}</p> : calculation}
        </div>
      </DialogContent>
    </Dialog>
  );
}

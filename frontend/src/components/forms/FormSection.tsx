import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function FormSection({ title, description, action, children }: FormSectionProps) {
  return (
    <Card className="border border-border/80 bg-background/70">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div className="flex-shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export const Section = ({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => <Card className="space-y-3 sm:space-y-4">
    <CardHeader className="space-y-3 sm:space-y-4">
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>
      <div>{children}</div>
    </CardContent>
  </Card>;
export const StatusPill = ({
  status
}: {
  status: 'new' | 'in-progress' | 'closed';
}) => {
  const variantByStatus = {
    new: 'new',
    'in-progress': 'inProgress',
    closed: 'closed'
  } as const;
  return <Badge variant={variantByStatus[status]}>{status}</Badge>;
};

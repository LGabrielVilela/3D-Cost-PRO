import { Suspense } from "react";

import { EditQuotePage } from "@/components/orcamentos/EditQuotePage";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Page(props: PageProps<"/orcamentos/[id]/editar">) {
  const { id } = await props.params;
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <EditQuotePage id={id} />
    </Suspense>
  );
}

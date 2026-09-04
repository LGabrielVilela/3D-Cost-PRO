import { EditQuotePage } from "@/components/orcamentos/EditQuotePage";

export default async function Page(props: PageProps<"/orcamentos/[id]/editar">) {
  const { id } = await props.params;
  return <EditQuotePage id={id} />;
}

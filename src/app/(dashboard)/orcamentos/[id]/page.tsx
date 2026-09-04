import { QuoteViewPage } from "@/components/orcamentos/QuoteViewPage";

export default async function Page(props: PageProps<"/orcamentos/[id]">) {
  const { id } = await props.params;
  return <QuoteViewPage id={id} />;
}

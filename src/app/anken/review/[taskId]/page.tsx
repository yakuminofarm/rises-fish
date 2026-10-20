import { ReviewView } from "@/anken/views/ReviewView";

export default async function Page({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  return <ReviewView taskId={taskId} />;
}

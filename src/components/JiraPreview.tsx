interface JiraPreviewProps {
  title: string;
}

export default function JiraPreview({ title }: JiraPreviewProps) {
  return (
    <div className="border rounded p-4 bg-gray-100 mt-4">
      <h4 className="font-semibold mb-2">Vista previa del título</h4>
      <p className="text-sm text-gray-800 break-words">{title || "—"}</p>
    </div>
  );
}
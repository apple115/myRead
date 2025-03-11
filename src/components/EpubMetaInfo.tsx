interface EpubMeta {
  title: string;
  author: string;
  description?: string;
}

interface EpubMetaInfoProps {
  meta: EpubMeta;
}

export function EpubMetaInfo({ meta }: EpubMetaInfoProps) {
  return (
    <div className="p-4 border rounded-lg mb-4">
      <h2 className="text-xl font-semibold">{meta.title}</h2>
      <p className="text-gray-600 mt-2">Author: {meta.author}</p>
      {meta.description && (
        <p className="text-gray-600 mt-2">{meta.description}</p>
      )}
    </div>
  );
}

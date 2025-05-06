import type { Rendition } from "epubjs";
import { ReactReader } from "react-reader";

interface EpubReaderContainerProps {
  epubFileUrl: string;
  location: string | null;
  onLocationChange: (loc: string) => void;
  onRenditionChange: (rendition: Rendition) => void;
}

export function EpubReaderContainer({
  location,
  onLocationChange,
  onRenditionChange,
  epubFileUrl,
}: EpubReaderContainerProps) {
  return (
    <div className="mt-4 h-[80vh] border rounded-lg overflow-hidden">
      <ReactReader
        url={epubFileUrl}
        location={location}
        locationChanged={onLocationChange}
        getRendition={onRenditionChange}
        epubOptions={{
          allowPopups: true,
          allowScriptedContent: true,
        }}
      />
    </div>
  );
}

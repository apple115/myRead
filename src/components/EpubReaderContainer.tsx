import { ReactReader } from "react-reader";
import type { Rendition, Contents } from "epubjs";

interface EpubReaderContainerProps {
  epubFile: Uint8Array | null;
  location: string | null;
  onLocationChange: (loc: string) => void;
  onRenditionChange: (rendition: Rendition) => void;
}

export function EpubReaderContainer({
  epubFile,
  location,
  onLocationChange,
  onRenditionChange,
}: EpubReaderContainerProps) {
  return (
    <div className="mt-4 h-[80vh] border rounded-lg overflow-hidden">
      <ReactReader
        //@ts-ignore
        url={epubFile?.buffer}
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

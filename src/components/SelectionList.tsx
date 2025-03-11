import type { Rendition } from "epubjs";

interface Selection {
  text: string | null;
  cfiRange: string;
}

interface SelectionListProps {
  selections: Selection[];
  rendition: Rendition | null;
  onRemove: (cfiRange: string) => void;
}

export function SelectionList({ selections, rendition, onRemove }: SelectionListProps) {
  return (
    <ul className="grid grid-cols-1 divide-y divide-stone-400 border-t border-stone-400 -mx-2">
      {selections.map(({ text, cfiRange }, i) => (
        <li key={i} className="p-2">
          <span>{text}</span>
          <button
            className="underline hover:no-underline text-sm mx-1"
            onClick={() => rendition?.display(cfiRange)}
          >
            Show
          </button>
          <button
            className="underline hover:no-underline text-sm mx-1"
            onClick={() => onRemove(cfiRange)}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

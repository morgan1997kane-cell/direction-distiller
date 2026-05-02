"use client";

import type { ChangeEvent } from "react";
import type { ReferenceImage } from "@/lib/types";

interface ImageUploaderProps {
  images: ReferenceImage[];
  onChange: (images: ReferenceImage[]) => void;
}

const acceptedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/gif"];

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
      .filter((file) => acceptedTypes.includes(file.type))
      .slice(0, 6 - images.length);

    Promise.all(
      files.map(
        (file) =>
          new Promise<ReferenceImage>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
                fileName: file.name,
                type: file.type,
                size: file.size,
                previewUrl: String(reader.result),
              });
            };
            reader.readAsDataURL(file);
          }),
      ),
    ).then((nextImages) => onChange([...images, ...nextImages].slice(0, 6)));

    event.target.value = "";
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-zinc-200">参考图</h3>
        <span className="text-xs text-zinc-500">{images.length}/6</span>
      </div>

      <label className="group flex min-h-36 cursor-pointer flex-col items-center justify-center border border-dashed border-white/15 bg-black/20 px-5 py-7 text-center transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.035]">
        <input
          className="sr-only"
          type="file"
          accept="image/png,image/jpg,image/jpeg,image/webp,image/gif"
          multiple
          onChange={handleFiles}
          disabled={images.length >= 6}
        />
        <span className="text-sm text-zinc-200">上传 1-6 张 png / jpg / webp / gif</span>
        <span className="mt-2 text-xs leading-5 text-zinc-500">
          第一版不会真实识图，会根据文件名、数量和项目类型生成模拟参考摘要。
        </span>
      </label>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden border border-white/10 bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.previewUrl} alt={image.fileName} className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(images.filter((item) => item.id !== image.id))}
                className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/70 px-2 py-1 text-xs text-zinc-100 opacity-90 transition hover:border-red-300/60 hover:text-red-100"
              >
                删除
              </button>
              <div className="truncate border-t border-white/10 px-2 py-1.5 text-xs text-zinc-500">
                {image.fileName}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

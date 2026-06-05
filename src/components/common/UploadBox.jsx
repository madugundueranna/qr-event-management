// src/components/common/UploadBox.jsx

import { useRef, useState } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";

export default function UploadBox({
  label = "Click to upload or drag and drop",
  hint = "JPG, PNG up to 10MB",
  multiple = true,
  onFilesChange,
}) {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const fileArr = Array.from(files);
    const urls = fileArr.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
    if (onFilesChange) onFilesChange(fileArr);
  };

  const removePreview = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragging
            ? "border-primary-500 bg-primary-50"
            : "border-primary-200 bg-primary-50 hover:border-primary-400"
        }`}
      >
        <FiUploadCloud className="mx-auto text-5xl text-primary-600" />
        <p className="mt-3 font-bold text-ink-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`Upload ${i + 1}`}
                className="h-20 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
              >
                <FiX className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

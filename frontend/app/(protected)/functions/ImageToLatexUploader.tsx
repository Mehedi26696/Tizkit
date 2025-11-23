import React, { useState } from 'react';

interface Props {
  onSubmit: (data: { type: 'text' | 'formula'; image: File }) => void;
}

const ImageToLatexUploader: React.FC<Props> = ({ onSubmit }) => {
  const [selectedType, setSelectedType] = useState<'text' | 'formula'>('text');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(e.target.value as 'text' | 'formula');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFile) {
      onSubmit({ type: selectedType, image: imageFile });
    }
  };

  return (
    <form className="p-4 border rounded shadow bg-white max-w-md mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-2">Image to LaTeX Converter</h2>
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            name="type"
            value="text"
            checked={selectedType === 'text'}
            onChange={handleTypeChange}
            className="mr-1"
          />
          Text (OCR)
        </label>
        <label>
          <input
            type="radio"
            name="type"
            value="formula"
            checked={selectedType === 'formula'}
            onChange={handleTypeChange}
            className="mr-1"
          />
          Formula (Pix2Tex)
        </label>
      </div>
      <div className="mb-4">
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
      {previewUrl && (
        <div className="mb-4">
          <img src={previewUrl} alt="Preview" className="max-h-48 border" />
        </div>
      )}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!imageFile}
      >
        Convert
      </button>
    </form>
  );
};

export default ImageToLatexUploader;
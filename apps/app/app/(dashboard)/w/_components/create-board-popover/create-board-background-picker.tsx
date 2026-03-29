"use client";

import { useState } from "react";
import { BackgroundColorPicker } from "./background-color-picker";
import { BackgroundImagePicker } from "./background-image-picker";

export function CreateBoardBackgroundPicker() {
  const [selectedColor, setSelectedColor] = useState<string | null>("#0079bf");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground text-xs">Background</p>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">Colors</p>
        <BackgroundColorPicker
          onChange={(color) => {
            setSelectedColor(color);
            setSelectedImage(null);
          }}
          value={selectedColor}
        />
      </div>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">Photos</p>
        <BackgroundImagePicker
          onChange={(url) => {
            setSelectedImage(url);
            setSelectedColor(null);
          }}
          value={selectedImage}
        />
      </div>
    </div>
  );
}

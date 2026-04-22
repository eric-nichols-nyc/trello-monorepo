"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/design-system/components/ui/tabs";
import { cn } from "@repo/design-system/lib/utils";
import { Paperclip, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  computePortalAnchorPosition,
  fitFixedPanelInViewport,
  type AnchorViewportRect,
} from "@/lib/ui/portal-panel-viewport";
import { toast } from "@/lib/toast";
import { useCreateCardAttachmentLink } from "@/queries/use-create-card-attachment-link";
import { useUploadCardAttachment } from "@/queries/use-upload-card-attachment";

const outlineChipClass =
  "gap-2 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100";

/** Matches {@link CopyCardPopover} panel width cap. */
const ATTACH_PANEL_MAX_WIDTH_PX = 360;

/** Matches Nest `MAX_ATTACHMENT_UPLOAD_BYTES` (25 MiB). */
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export type UploadAttachmentsPopoverProps = {
  cardId: string;
  boardRouteKey: string;
  triggerClassName?: string;
};

export function UploadAttachmentsPopover({
  cardId,
  boardRouteKey,
  triggerClassName,
}: UploadAttachmentsPopoverProps) {
  const linkUrlId = useId();
  const linkDisplayId = useId();
  const fileDisplayNameId = useId();

  const anchorReference = useRef<HTMLDivElement>(null);
  const panelReference = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [panelPlacement, setPanelPlacement] = useState<{
    position: { left: number; top: number };
    anchorViewport: AnchorViewportRect;
  }>(() => ({
    position: { left: 0, top: 0 },
    anchorViewport: { top: 0, bottom: 0, left: 0, right: 0 },
  }));
  const [placedAt, setPlacedAt] = useState({ left: 0, top: 0 });

  const [attachTab, setAttachTab] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDisplayName, setFileDisplayName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDisplayText, setLinkDisplayText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputReference = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setAttachTab("file");
    setSelectedFile(null);
    setFileDisplayName("");
    setLinkUrl("");
    setLinkDisplayText("");
    setIsDragging(false);
  };

  const closePanel = useCallback(() => {
    resetForm();
    setOpen(false);
  }, []);

  const updatePanelPlacement = useCallback(() => {
    const node = anchorReference.current;
    if (!node) {
      return;
    }
    setPanelPlacement(
      computePortalAnchorPosition(node, ATTACH_PANEL_MAX_WIDTH_PX),
    );
  }, []);

  const finishSuccess = () => {
    resetForm();
    setOpen(false);
  };

  const uploadMutation = useUploadCardAttachment({
    boardRouteKey,
    cardId,
    onSuccess: finishSuccess,
  });

  const linkMutation = useCreateCardAttachmentLink({
    boardRouteKey,
    cardId,
    onSuccess: finishSuccess,
  });

  const busy = uploadMutation.isPending || linkMutation.isPending;

  const pickFile = (file: File | undefined) => {
    if (!file) {
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error(
        `File is too large (max ${Math.round(MAX_ATTACHMENT_BYTES / (1024 * 1024))} MB)`,
      );
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (attachTab === "file") {
      if (!selectedFile) {
        toast.error("Choose a file");
        return;
      }
      uploadMutation.mutate({
        file: selectedFile,
        name: fileDisplayName.trim() || undefined,
      });
      return;
    }

    const url = linkUrl.trim();
    if (url.length === 0) {
      toast.error("Enter a link");
      return;
    }
    linkMutation.mutate({
      url,
      name: linkDisplayText.trim() || undefined,
    });
  };

  const togglePanel = () => {
    if (open) {
      closePanel();
      return;
    }
    updatePanelPlacement();
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    updatePanelPlacement();
  }, [open, updatePanelPlacement]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handle = () => updatePanelPlacement();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [open, updatePanelPlacement]);

  useLayoutEffect(() => {
    const el = panelReference.current;
    if (!el || !open) {
      return;
    }
    const apply = () => {
      setPlacedAt(
        fitFixedPanelInViewport({
          el,
          position: panelPlacement.position,
          anchorViewport: panelPlacement.anchorViewport,
        }),
      );
    };
    apply();
    const observer = new ResizeObserver(() => apply());
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, panelPlacement]);

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            aria-label="Attach"
            aria-modal="true"
            className={cn(
              "fixed z-200 flex w-[min(100vw-1rem,360px)] max-h-[min(100dvh-2rem,100vh-2rem)] flex-col overflow-hidden rounded-xl border border-zinc-600/80 bg-zinc-800 text-zinc-100 shadow-lg",
            )}
            onPointerDown={(event) => event.stopPropagation()}
            ref={panelReference}
            role="dialog"
            style={{ left: placedAt.left, top: placedAt.top }}
          >
            <div className="relative shrink-0 border-zinc-600/80 border-b px-10 py-3">
              <h2 className="text-center font-semibold text-base text-zinc-100">
                Attach
              </h2>
              <Button
                aria-label="Close"
                className={cn(
                  "-translate-y-1/2 absolute top-1/2 right-1.5 size-8 shrink-0 rounded-md",
                  "text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100",
                  "focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/80",
                )}
                onClick={closePanel}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X aria-hidden className="size-4" />
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-4 py-3">
              <Tabs
                className="gap-0"
                onValueChange={(value) => {
                  setAttachTab(value === "link" ? "link" : "file");
                }}
                value={attachTab}
              >
                <TabsList
                  className={cn(
                    "h-auto w-full justify-start gap-8 rounded-none border-zinc-600/80 border-b bg-transparent p-0",
                  )}
                >
                  <TabsTrigger
                    className={cn(
                      "rounded-none border-0 border-transparent border-b-2 bg-transparent px-0 pb-2 text-sm text-zinc-100",
                      "data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                    )}
                    value="file"
                  >
                    File
                  </TabsTrigger>
                  <TabsTrigger
                    className={cn(
                      "rounded-none border-0 border-transparent border-b-2 bg-transparent px-0 pb-2 text-sm text-zinc-100",
                      "data-[state=active]:border-sky-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                    )}
                    value="link"
                  >
                    Link
                  </TabsTrigger>
                </TabsList>

                <TabsContent className="mt-3 flex flex-col gap-4" value="file">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-200">
                      Attach a file from your computer
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      You can also drag and drop files to upload them.
                    </p>
                  </div>

                  <input
                    aria-label="Choose file"
                    className="sr-only"
                    disabled={busy}
                    onChange={(event) => {
                      pickFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                    ref={fileInputReference}
                    type="file"
                  />

                  <div
                    className={cn(
                      "rounded-lg border border-dashed border-zinc-600 bg-zinc-900/40 p-4 transition-colors",
                      isDragging && "border-sky-500/80 bg-zinc-800/60",
                    )}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node,
                        )
                      ) {
                        setIsDragging(false);
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "copy";
                      setIsDragging(true);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDragging(false);
                      pickFile(event.dataTransfer.files?.[0]);
                    }}
                  >
                    <div className="mb-3 flex min-h-5 items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm text-zinc-400">
                        {selectedFile ? selectedFile.name : "No file chosen"}
                      </p>
                      {selectedFile ? (
                        <Button
                          className="h-7 shrink-0 px-2 text-xs text-zinc-400"
                          disabled={busy}
                          onClick={() => setSelectedFile(null)}
                          type="button"
                          variant="ghost"
                        >
                          Clear
                        </Button>
                      ) : null}
                    </div>
                    <Button
                      className="w-full border border-zinc-600 bg-zinc-800/90 font-medium text-zinc-100 hover:bg-zinc-700"
                      disabled={busy}
                      onClick={() => fileInputReference.current?.click()}
                      type="button"
                      variant="secondary"
                    >
                      Choose a file
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      className="text-xs text-zinc-400"
                      htmlFor={fileDisplayNameId}
                    >
                      Display name{" "}
                      <span className="font-normal text-zinc-500">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      className="border-zinc-600 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-sky-500 focus-visible:ring-sky-500/40"
                      disabled={busy}
                      id={fileDisplayNameId}
                      maxLength={255}
                      onChange={(event) =>
                        setFileDisplayName(event.target.value)
                      }
                      placeholder="Defaults to the file name"
                      value={fileDisplayName}
                    />
                  </div>
                </TabsContent>

                <TabsContent className="mt-3 flex flex-col gap-4" value="link">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-300" htmlFor={linkUrlId}>
                      Search or paste a link{" "}
                      <span
                        className="text-red-500"
                        title="Required to attach a link"
                      >
                        *
                      </span>
                    </Label>
                    <Input
                      className="border-zinc-600 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-sky-500 focus-visible:ring-sky-500/40"
                      disabled={busy}
                      id={linkUrlId}
                      onChange={(event) => setLinkUrl(event.target.value)}
                      placeholder="Find recent links or paste a new link"
                      value={linkUrl}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      className="text-xs text-zinc-400"
                      htmlFor={linkDisplayId}
                    >
                      Display text{" "}
                      <span className="font-normal text-zinc-500">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      className="border-zinc-600 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-sky-500 focus-visible:ring-sky-500/40"
                      disabled={busy}
                      id={linkDisplayId}
                      maxLength={255}
                      onChange={(event) =>
                        setLinkDisplayText(event.target.value)
                      }
                      placeholder="Text to display"
                      value={linkDisplayText}
                    />
                    <p className="text-xs text-zinc-500">
                      Give this link a title or description
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="shrink-0 border-zinc-600/80 border-t px-4 py-3">
              <Button
                aria-busy={busy}
                className={cn(
                  "w-full bg-sky-500 font-medium text-zinc-950 hover:bg-sky-400",
                  "focus-visible:ring-sky-400/80",
                )}
                disabled={busy}
                onClick={handleSubmit}
                type="button"
              >
                {busy ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className="relative inline-flex"
      ref={anchorReference}
    >
      <Button
        aria-expanded={open}
        className={cn(outlineChipClass, triggerClassName)}
        onClick={togglePanel}
        onPointerDown={(event) => event.stopPropagation()}
        size="sm"
        type="button"
        variant="outline"
      >
        <Paperclip className="size-4" />
        Attachment
      </Button>
      {panel}
    </div>
  );
}

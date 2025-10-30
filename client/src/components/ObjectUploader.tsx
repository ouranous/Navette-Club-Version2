// Simplified file uploader - replacing Uppy to avoid build issues
import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: any) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "secondary";
  children: ReactNode;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "outline",
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    // Validate file count
    if (files.length > maxNumberOfFiles) {
      setError(`Maximum ${maxNumberOfFiles} fichier(s) autorisé(s)`);
      return;
    }

    // Validate file sizes
    for (const file of files) {
      if (file.size > maxFileSize) {
        setError(`Taille maximale: ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`);
        return;
      }
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedFiles: any[] = [];

      for (const file of selectedFiles) {
        const params = await onGetUploadParameters();
        
        const response = await fetch(params.url, {
          method: params.method,
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        uploadedFiles.push({
          successful: [{ uploadURL: params.url.split('?')[0] }],
        });
      }

      onComplete?.({ successful: uploadedFiles });
      setShowModal(false);
      setSelectedFiles([]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)} 
        className={buttonClassName}
        variant={buttonVariant}
        type="button"
        data-testid="button-upload"
      >
        {children}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Télécharger des fichiers</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <input
                type="file"
                id="file-input"
                className="hidden"
                multiple={maxNumberOfFiles > 1}
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner {maxNumberOfFiles > 1 ? 'des fichiers' : 'un fichier'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Max: {maxNumberOfFiles} fichier(s), {(maxFileSize / 1024 / 1024).toFixed(0)}MB chacun
                </p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={uploading}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="flex-1"
                data-testid="button-confirm-upload"
              >
                {uploading ? 'Envoi...' : 'Télécharger'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

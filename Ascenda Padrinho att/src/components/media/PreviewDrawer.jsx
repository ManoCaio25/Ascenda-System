import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@padrinho/components/ui/sheet";
import { Button } from "@padrinho/components/ui/button";
import { Download, Youtube, FileText, Image as ImageIcon, Video, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";

export default function PreviewDrawer({ isOpen, onClose, course }) {
  const [zoom, setZoom] = useState(100);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfTotal, setPdfTotal] = useState(1);

  useEffect(() => {
    if (isOpen && course) {
      setZoom(100);
      setPdfPage(1);
    }
  }, [isOpen, course]);

  if (!course) return null;

  const handleDownload = () => {
    if (course.file_url) {
      window.open(course.file_url, '_blank');
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleFullscreen = () => {
    if (course.file_url) {
      window.open(course.file_url, '_blank');
    }
  };

  const renderPreview = () => {
    if (course.youtube_video_id) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-error">
            <Youtube className="w-5 h-5" />
            <span className="font-medium">YouTube Video</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-black">
            <iframe
              className="w-full h-[400px]"
              src={`https://www.youtube.com/embed/${course.youtube_video_id}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube Preview"
            />
          </div>
        </div>
      );
    }

    if (course.file_url) {
      const mime = course.file_mime || '';
      
      if (mime.startsWith('video/')) {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand">
                <Video className="w-5 h-5" />
                <span className="font-medium">Video File</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreen}
                  className="border-border"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Fullscreen
                </Button>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                className="w-full max-h-[500px]"
                controls
                src={course.file_url}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        );
      }

      if (mime.startsWith('image/')) {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand">
                <ImageIcon className="w-5 h-5" />
                <span className="font-medium">Image</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="border-border"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-secondary px-2 py-1">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="border-border"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreen}
                  className="border-border"
                  aria-label="Open fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-border bg-surface2">
              <div className="overflow-auto max-h-[600px]">
                <img
                  src={course.file_url}
                  alt={course.file_name || 'Preview'}
                  className="w-full object-contain"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                />
              </div>
            </div>
          </div>
        );
      }

      if (mime === 'application/pdf') {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-error">
                <FileText className="w-5 h-5" />
                <span className="font-medium">PDF Document</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPdfPage(prev => Math.max(1, prev - 1))}
                  disabled={pdfPage === 1}
                  className="border-border"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-secondary px-2">
                  Page {pdfPage} / {pdfTotal}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPdfPage(prev => Math.min(pdfTotal, prev + 1))}
                  disabled={pdfPage === pdfTotal}
                  className="border-border"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="border-border"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-secondary px-2">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="border-border"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreen}
                  className="border-border"
                  aria-label="Open fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-border bg-surface2">
              <iframe
                src={`${course.file_url}#page=${pdfPage}&zoom=${zoom}`}
                className="w-full h-[600px]"
                title="PDF Preview"
              />
            </div>
          </div>
        );
      }

      if (mime.includes('spreadsheet') || mime.includes('excel') || course.file_name?.endsWith('.xlsx')) {
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-success">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Spreadsheet (Excel)</span>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface2 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted" />
              <p className="text-primary font-medium mb-2">{course.file_name || 'Spreadsheet'}</p>
              {course.file_size && (
                <p className="text-sm text-muted mb-4">
                  {(course.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
              <p className="text-sm text-secondary mb-4">
                Excel files can be downloaded and opened in Microsoft Excel or Google Sheets
              </p>
              <Button
                onClick={handleDownload}
                className="bg-brand hover:bg-brand/90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Spreadsheet
              </Button>
            </div>
          </div>
        );
      }

      if (mime.includes('document') || mime.includes('word') || course.file_name?.endsWith('.docx')) {
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Word Document</span>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface2 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted" />
              <p className="text-primary font-medium mb-2">{course.file_name || 'Document'}</p>
              {course.file_size && (
                <p className="text-sm text-muted mb-4">
                  {(course.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
              <p className="text-sm text-secondary mb-4">
                Word documents can be downloaded and opened in Microsoft Word or Google Docs
              </p>
              <Button
                onClick={handleDownload}
                className="bg-brand hover:bg-brand/90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Document
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand">
            <FileText className="w-5 h-5" />
            <span className="font-medium">File Attachment</span>
          </div>
          <div className="p-6 rounded-xl border border-border bg-surface2 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted" />
            <p className="text-primary font-medium mb-2">{course.file_name || 'Course Material'}</p>
            {course.file_size && (
              <p className="text-sm text-muted mb-4">
                {(course.file_size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            <Button
              onClick={handleDownload}
              className="bg-brand hover:bg-brand/90 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl bg-surface border-border overflow-y-auto">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-primary">{course.title}</SheetTitle>
          {course.description && (
            <p className="text-sm text-muted mt-2">{course.description}</p>
          )}
        </SheetHeader>

        <div className="mt-6">
          {renderPreview()}
        </div>

        {course.file_url && !course.file_mime?.startsWith('image/') && !course.file_mime?.startsWith('video/') && course.file_mime !== 'application/pdf' && (
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full border-border hover:bg-surface2"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Material
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
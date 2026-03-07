import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadToStorage } from "@/lib/storage";
import { useCreatePost } from "@/hooks/useChallengePosts";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  challengeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePostDialog = ({ challengeId, open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!caption.trim() && !imageFile) {
      toast.error("Adicione uma imagem ou legenda");
      return;
    }

    let imageUrl: string | undefined;

    if (imageFile) {
      setUploading(true);
      const path = await uploadToStorage(imageFile, user!.id, `${challengeId}_`);
      if (!path) {
        toast.error("Erro ao enviar imagem");
        setUploading(false);
        return;
      }
      imageUrl = path;
      setUploading(false);
    }

    createPost.mutate(
      { challengeId, imageUrl, caption: caption.trim() || undefined },
      {
        onSuccess: () => {
          setCaption("");
          setImageFile(null);
          setPreview(null);
          onOpenChange(false);
        },
      }
    );
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[20px]">
        <DialogHeader>
          <DialogTitle>Novo post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image preview */}
          {preview ? (
            <div className="relative rounded-[14px] overflow-hidden">
              <img src={preview} alt="" className="w-full aspect-square object-cover" />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video rounded-[14px] border-2 border-dashed border-subtle flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/30 transition-colors"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-[13px]">Adicionar imagem</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Escreva uma legenda..."
            className="rounded-[14px] min-h-[80px] text-[14px] resize-none"
            maxLength={500}
          />

          <Button
            onClick={handleSubmit}
            disabled={uploading || createPost.isPending}
            className="w-full h-12 rounded-[14px] text-[14px] font-bold"
          >
            {uploading || createPost.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Publicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;

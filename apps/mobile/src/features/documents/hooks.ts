import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import type { DocumentOwnerType, DocumentType, IsoDate } from '@yocabs/api-client';
import { api } from '@/shared/api/client';
import { keys } from '@/shared/query/keys';

export function useDocuments(ownerType: DocumentOwnerType, ownerId: string) {
  return useQuery({
    queryKey: keys.documents(ownerType, ownerId),
    queryFn: () => api.documents.list(ownerType, ownerId),
  });
}

interface UploadArgs {
  documentType: DocumentType;
  expiryDate?: IsoDate;
}

/** Lets the person pick a photo or PDF and uploads it. Resolves to null if they cancel the picker. */
export function useUploadDocument(ownerType: DocumentOwnerType, ownerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentType, expiryDate }: UploadArgs) => {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return null;

      const file = picked.assets[0];
      return api.documents.upload({
        ownerType,
        ownerId,
        documentType,
        expiryDate,
        file: { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' },
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.documents(ownerType, ownerId) }),
  });
}

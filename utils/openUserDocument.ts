import type { Document } from '@/types/profile.types';
import { resolveApiMediaUrl } from '@/utils/certificateDownload';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking } from 'react-native';

export type OpenableDocument = Pick<Document, 'fileUrl' | 'fileName' | 'fileType'>;

function inferMimeType(doc: OpenableDocument): string {
    return String(doc.fileType ?? '').trim().toLowerCase();
}

function inferFileName(doc: OpenableDocument): string {
    return String(doc.fileName ?? 'document').trim() || 'document';
}

export function isUserDocumentImage(doc: OpenableDocument): boolean {
    const mime = inferMimeType(doc);
    const name = inferFileName(doc).toLowerCase();
    return (
        mime.startsWith('image/') ||
        /\.(jpe?g|png|gif|webp|heic|bmp|svg)$/i.test(name)
    );
}

export function isUserDocumentVideo(doc: OpenableDocument): boolean {
    const mime = inferMimeType(doc);
    const name = inferFileName(doc).toLowerCase();
    return mime.startsWith('video/') || /\.(mp4|mov|m4v|webm|avi)$/i.test(name);
}

export function isUserDocumentPdf(doc: OpenableDocument): boolean {
    const mime = inferMimeType(doc);
    const name = inferFileName(doc).toLowerCase();
    return mime === 'application/pdf' || name.endsWith('.pdf');
}

export function resolveUserDocumentUrl(fileUrl?: string | null): string | null {
    return resolveApiMediaUrl(fileUrl);
}

/** Open a profile / mentee uploaded document for viewing. */
export async function openUserDocument(doc: OpenableDocument): Promise<void> {
    const url = resolveUserDocumentUrl(doc.fileUrl);
    if (!url) {
        Alert.alert('Unable to open', 'This document does not have a valid file location.');
        return;
    }

    const fileName = inferFileName(doc);
    const mime = inferMimeType(doc);
    const isImage = isUserDocumentImage(doc);
    const isPdf = isUserDocumentPdf(doc);
    const isVideo = isUserDocumentVideo(doc);

    try {
        if (/^https?:\/\//i.test(url) && (isPdf || isImage)) {
            await WebBrowser.openBrowserAsync(url);
            return;
        }

        if (/^https?:\/\//i.test(url) && isVideo) {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
                return;
            }
        }

        const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
        if (baseDir) {
            const safeName = fileName.replace(/[^\w.\-]/g, '_');
            const targetUri = `${baseDir}${safeName}`;
            const downloaded = await FileSystem.downloadAsync(url, targetUri);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(downloaded.uri, {
                    mimeType: mime || undefined,
                    dialogTitle: fileName,
                });
                return;
            }

            await Linking.openURL(downloaded.uri);
            return;
        }

        await Linking.openURL(url);
    } catch (error) {
        console.error('Failed to open document', error);
        try {
            await Linking.openURL(url);
        } catch {
            Alert.alert(
                'Unable to open',
                'Could not open this document. Please try again later.',
            );
        }
    }
}

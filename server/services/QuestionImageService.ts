const jpgDataUrlPrefix = 'data:image/jpeg;base64,';

export class QuestionImageService {
    toDatabaseBytes(imageSrc?: string): Uint8Array<ArrayBuffer> | undefined {
        if (!imageSrc?.trim()) {
            return undefined;
        }

        const base64 = imageSrc.startsWith(jpgDataUrlPrefix)
            ? imageSrc.slice(jpgDataUrlPrefix.length)
            : imageSrc;

        return Uint8Array.from(Buffer.from(base64, 'base64'));
    }

    toImageSrc(imageData?: Uint8Array | Buffer | null): string | undefined {
        if (!imageData?.byteLength) {
            return undefined;
        }

        return `${jpgDataUrlPrefix}${Buffer.from(imageData).toString('base64')}`;
    }
}

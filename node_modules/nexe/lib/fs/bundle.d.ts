/// <reference types="node" />
import { Readable } from 'stream';
export declare function toStream(content: Buffer | string): Readable;
export declare type File = {
    absPath: string;
    contents: string;
    deps: FileMap;
};
export declare type FileMap = {
    [absPath: string]: File | null;
};
export interface BundleOptions {
    entries: string[];
    cwd: string;
    expand: boolean;
    loadContent: boolean;
    files: FileMap;
}
export declare class Bundle {
    constructor({ cwd }?: {
        cwd: string;
    });
    cwd: string;
    blobSize: number;
    index: {
        [relativeFilePath: string]: [number, number];
    };
    streams: (Readable | (() => Readable))[];
    addResource(absoluteFileName: string, content?: Buffer | string): Promise<void>;
    concat(): void;
    toStream(): NodeJS.ReadableStream;
    toJSON(): {
        [relativeFilePath: string]: [number, number];
    };
}

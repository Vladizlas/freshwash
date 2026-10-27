
declare module "bwip-js" {
  interface BarcodeOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    includetext?: boolean;
    textxalign?: string;
    [key: string]: unknown;
  }

  interface BarcodeResult {
    toBuffer(): Promise<Buffer>;
  }

  const bwipjs: {
    toBuffer(options: BarcodeOptions): Promise<Buffer>;
  };

  export default bwipjs;
}

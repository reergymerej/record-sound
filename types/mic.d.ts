declare module 'mic' {
    interface MicOptions {
      rate?: string;
      channels?: string;
      debug?: boolean;
      device?: string;
      // Add more options as needed
    }

    interface MicInputStream extends NodeJS.ReadableStream {
      stop: () => void;
      pause: () => void;
      resume: () => void;
      getAudioStream: () => NodeJS.ReadableStream;
    }

    interface MicInstance {
      start: () => MicInputStream;
      stop: () => void;
      getAudioStream: () => NodeJS.ReadableStream;
    }

    function mic(options?: MicOptions): MicInstance;

    export = mic;
  }

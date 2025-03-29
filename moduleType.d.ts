declare module 'react';
declare module 'react-dom';
declare module 'react-icons/*';
declare module '@fortawesome/*';
declare module 'react-markdown';
declare module 'react-syntax-highlighter';
declare module 'remark-gfm';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
} 
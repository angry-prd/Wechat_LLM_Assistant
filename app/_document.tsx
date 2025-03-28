import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh-CN" className="scroll-smooth">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 防止页面初始滚动
              window.onload = function() {
                window.scrollTo(0, 0);
                setTimeout(() => {
                  document.body.style.scrollBehavior = 'smooth';
                }, 100);
              };
            `,
          }}
        />
      </Head>
      <body className="overflow-x-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 
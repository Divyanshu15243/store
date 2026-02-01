import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    // Use safe fallbacks (no API calls here)
    const favicon = process.env.NEXT_PUBLIC_FAVICON || "/favicon.png";
    const metaTitle =
      process.env.NEXT_PUBLIC_META_TITLE ||
      "KachaBazar - React Grocery & Organic Food Store e-commerce Template";
    const metaDescription =
      process.env.NEXT_PUBLIC_META_DESCRIPTION ||
      "React Grocery & Organic Food Store e-commerce Template";
    const metaKeywords =
      process.env.NEXT_PUBLIC_META_KEYWORDS || "ecommerce online store";
    const metaUrl =
      process.env.NEXT_PUBLIC_META_URL || "https://kachabazar-store.vercel.app/";
    const metaImg =
      process.env.NEXT_PUBLIC_META_IMG ||
      "https://res.cloudinary.com/ahossain/image/upload/v1636729752/facebook-page_j7alju.png";

    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href={favicon} />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:type" content="eCommerce Website" />
          <meta property="og:description" content={metaDescription} />
          <meta name="keywords" content={metaKeywords} />
          <meta property="og:url" content={metaUrl} />
          <meta property="og:image" content={metaImg} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

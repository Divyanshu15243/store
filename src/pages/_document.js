import SettingServices from "@services/SettingServices";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    // Fetch general metadata from backend API
    const setting = await SettingServices.getStoreSeoSetting();

    return { ...initialProps, setting };
  }

  render() {
    const setting = this.props.setting;
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href={setting?.favicon || "/siteicon.svg"} />
          <meta
            property="og:title"
            content={
              setting?.meta_title ||
              "N23 Gujarati Basket"
            }
          />
          <meta property="og:type" content="eCommerce Website" />
          <meta
            property="og:description"
            content={
              setting?.meta_description ||
              "N23 Gujarati Basket Online Store"
            }
          />
          <meta
            name="keywords"
            content={setting?.meta_keywords || "ecommerce online store"}
          />
          <meta
            property="og:url"
            content={
              setting?.meta_url || "https://www.n23gujaratibasket.com/"
            }
          />
          <meta
            property="og:image"
            content={
              setting?.meta_img ||
              "https://res.cloudinary.com/ahossain/image/upload/v1636729752/facebook-page_j7alju.png"
            }
          />
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

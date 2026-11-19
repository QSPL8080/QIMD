import SeoLandingPage, { seoMetadata } from "@/components/SeoLanding/SeoLandingPage";

const PATH = "video-editing-courses-pune";

export const metadata = seoMetadata(PATH);

export default function Page() {
  return <SeoLandingPage path={PATH} />;
}

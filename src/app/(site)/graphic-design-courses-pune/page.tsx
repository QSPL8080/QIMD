import SeoLandingPage, { seoMetadata } from "@/components/SeoLanding/SeoLandingPage";

const PATH = "graphic-design-courses-pune";

export const metadata = seoMetadata(PATH);

export default function Page() {
  return <SeoLandingPage path={PATH} />;
}

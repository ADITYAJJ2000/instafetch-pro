import { PageLayout } from "@/components/PageLayout";
import { InstagramDownloader } from "@/components/InstagramDownloader";
import { Features } from "@/components/Features";

const ReelsPage = () => {
  return (
    <PageLayout>
      <InstagramDownloader />
      <Features />
    </PageLayout>
  );
};

export default ReelsPage;

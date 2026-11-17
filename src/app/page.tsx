import Banner from "@/components/Banner";
import Gallery from "@/components/Gallery";
import Newsletter from "@/components/Newsletter";
import RecentEvents from "@/components/RecentEvents";
import Stats from "@/components/Stats";

export default function Home() {
  return (
    <>
      <Banner />
      <Stats />
      <RecentEvents />
      <Gallery />
      <Newsletter />
    </>
  );
}

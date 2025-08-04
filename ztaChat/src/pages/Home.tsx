import Header from "@/components/Shared/Header";
import { data } from "@/components/Sidebar/sidebar";
const Home = () => {
  return (
    <div>
      <Header
        url={data.navMain[0].url}
        navTitle={data.navMain[0].title}
        title={data.navMain[0].items[0].title}
      />
    </div>
  );
};

export default Home;

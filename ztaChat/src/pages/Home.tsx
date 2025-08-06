import Header from "@/components/Shared/Header";
import { getSidebarData } from "@/components/Sidebar/sidebar";
import useFriends from "@/utils/Hooks/useFriends";

const Home = () => {
  const { friends } = useFriends();
  const data = getSidebarData(friends);

  return (
    <div>
      <Header
        url={data.navMain[0]?.url || "#"}
        navTitle={data.navMain[0]?.title || "Chats"}
        title={data.navMain[0]?.items[0]?.title || "No friends"}
      />
    </div>
  );
};

export default Home;

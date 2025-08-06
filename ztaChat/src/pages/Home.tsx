import Header from "@/components/Shared/Header";

const Home = () => {
  return (
    <div>
      <Header
        url={"/home"}
        navTitle="Chats"
        title={"No Chat Selected"}
      />
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <p>Start a secure chat with your friends</p>
      </div>
    </div>
  );
};

export default Home;

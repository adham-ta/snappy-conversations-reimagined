
import Chat from '@/components/Chat';

const Index = () => {
  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 bg-chat-primary text-white">
        <h1 className="text-xl font-semibold">Advanced Chat</h1>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
};

export default Index;

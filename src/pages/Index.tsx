
import Chat from '@/components/Chat';
import UserMenu from '@/components/UserMenu';
import ThemeToggle from '@/components/ThemeToggle';

const Index = () => {
  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 bg-chat-primary text-white flex justify-between items-center">
        <h1 className="text-xl font-semibold">Advanced Chat</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
};

export default Index;

import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  id: number;
  sender: string;
  message: string;
}

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <ScrollArea className="flex-1 p-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex mb-4 ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
          <div className={`rounded-lg p-3 max-w-xs ${msg.sender === 'You' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <p>{msg.message}</p>
          </div>
        </div>
      ))}
    </ScrollArea>
  )
}
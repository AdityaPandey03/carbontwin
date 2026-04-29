import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { api } from '../../services/mockApi';
export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
  {
    role: 'assistant',
    content:
    "I'm your AI Eco-Coach. I don't do small talk. I do carbon reduction. What do you need?"
  }]
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages((prev) => [
    ...prev,
    {
      role: 'user',
      content: userMsg
    }]
    );
    setIsTyping(true);
    const response = await api.chat.sendMessage(userMsg);
    setIsTyping(false);
    setMessages((prev) => [
    ...prev,
    {
      role: 'assistant',
      content: response.text
    }]
    );
  };
  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen &&
        <motion.div
          initial={{
            scale: 0
          }}
          animate={{
            scale: 1
          }}
          exit={{
            scale: 0
          }}
          className="fixed bottom-6 right-6 z-50">
          
            <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            onClick={() => setIsOpen(true)}>
            
              <MessageSquare className="h-6 w-6 text-white" />
            </Button>
          </motion.div>
        }
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }}
          className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          
            {/* Header */}
            <div className="bg-emerald-900/50 border-b border-emerald-500/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 p-1.5 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Grok Eco-Coach
                  </h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online & Judging You
                  </p>
                </div>
              </div>
              <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}>
              
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) =>
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                    <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-secondary text-foreground rounded-tl-sm border border-border'}`}>
                  
                      {msg.content}
                    </div>
                  </div>
              )}
                {isTyping &&
              <div className="flex justify-start">
                    <div className="bg-secondary text-foreground rounded-2xl rounded-tl-sm px-4 py-3 border border-border flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                      <span
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                    style={{
                      animationDelay: '0.2s'
                    }} />
                  
                      <span
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                    style={{
                      animationDelay: '0.4s'
                    }} />
                  
                    </div>
                  </div>
              }
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask why your score dropped..."
                className="bg-secondary border-border focus-visible:ring-emerald-500" />
              
                <Button
                type="submit"
                size="icon"
                className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                disabled={!input.trim() || isTyping}>
                
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}
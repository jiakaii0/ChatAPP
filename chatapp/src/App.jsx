import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

// Import the GoogleGenerativeAI class
import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "EnterYourGoogleAPI"; // You will need to generate google API key

// Configure the generation settings
const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

function App() {
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState([
        {
            message: "Hello, I am OwenBot. Please ask me anything.",
            sender: "CHATAPP",
            direction: "incoming",
        },
    ]);

    // Initialize Google Generative AI instance
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
    });

    const handleSend = async (message) => {
        const newMessage = {
            message: message,
            sender: "user",
            direction: "outgoing",
        };

        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setTyping(true);

        await processMessageToGoogleAI(newMessages);
    };

    async function processMessageToGoogleAI(chatMessages) {
        try {
            const chatSession = model.startChat({
                generationConfig,
                history: chatMessages.map((msg) => ({
                    role: msg.sender === "user" ? "user" : "model",
                    parts: [{ text: msg.message }],
                })),
            });

            const result = await chatSession.sendMessage(
                chatMessages[chatMessages.length - 1].message
            );

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    message: result.text, // Adjusted based on assumed library API
                    sender: "CHATAPP",
                    direction: "incoming",
                },
            ]);
        } catch (error) {
            console.error("Error generating response:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    message: "Oops! Something went wrong. Please try again.",
                    sender: "CHATAPP",
                    direction: "incoming",
                },
            ]);
        } finally {
            setTyping(false);
        }
    }

    return (
        <div className="CHATAPP">
            <div style={{ position: "relative", height: "80vh", width: "900px" }}>
                <MainContainer>
                    <ChatContainer>
                        <MessageList
                            scrollBehavior="smooth"
                            typingIndicator={
                                typing ? <TypingIndicator content="CHATAPP is typing..." /> : null
                            }
                        >
                            {messages.map((message, i) => (
                                <Message key={i} model={message} />
                            ))}
                        </MessageList>
                        <MessageInput placeholder="Type message here" onSend={handleSend} />
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    );
}

export default App;

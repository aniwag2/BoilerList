import {useState, useEffect, useRef} from 'react';
import {Box, Typography, TextField, Button, List, ListItem} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { ragQuery } from '../api/user';

const Messaging = ({messages, setMessages}) => {    
    const [input, setInput] = useState("");

    const bottomRef = useRef(null);

    const handleSend = async() => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { sender: "user", content: input }]);
        setInput("");
        setTimeout(async () => {
            setMessages(prev => [...prev, { sender: "bot", content: "..." }]);
            const response = await ragQuery(input);
            setMessages(prev => [...prev.slice(0, -1), { sender: "bot", content: response.message }]); 
        }, 1000);
    };

    // Automatically scroll to the bottom of the list when new messages are added
    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    return (
        <Box sx={{
            position: "absolute", top: "60%", left: "75%", transform: "translate(-50%, -50%)",
            bgcolor: "#1e1e1e", color: "#fff", borderRadius: 3, boxShadow: 24, p: 4, width: "25%", maxWidth: 500, textAlign: "center", height: "50%", overflow: "auto"
        }}>
            <Typography variant="h6">BoilerList Support Chatbot</Typography>
            <Box sx = {{
                        bgcolor: "#1e1e1e",
                        color: "#fff",
                        borderRadius: 3,
                        width: "100%",
                        textAlign: "center",
                        height: "70%",
                        overflow: "auto",
                        marginBottom: "5%",
                    }}>
                <List sx={{mb: 1}}>
                    {messages.map((msg, i) => (
                        <ListItem key={i} sx={{ justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                            <Box bgcolor={msg.sender === "user" ? "black" : "gold"} color={msg.sender === "user" ? "gold" : "black"} px={2} py={1} borderRadius={2}>
                                {msg.content}
                            </Box>
                        </ListItem>
                    ))}
                </List>
                <div ref={bottomRef} />
            </Box>
            
            <Box display="flex" gap={1}>
                <TextField
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    sx={{
                        backgroundColor: "white",
                        color: "black"
                    }}
                />
                <Button onClick={handleSend} variant="contained">
                    <SendIcon />
                </Button>
            </Box>
        </Box>
    )
}
export default Messaging;
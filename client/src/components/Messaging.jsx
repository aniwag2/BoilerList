// client/src/components/Messaging.jsx
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react'; // Added useContext, useCallback
import { Box, Typography, TextField, Button, List, ListItem,
         Tabs, Tab, IconButton, CircularProgress, Tooltip, InputBase, // Added Tabs, Tab, IconButton, CircularProgress, Tooltip, InputBase
         Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText // For rename/delete confirmation
} from '@mui/material'; // Added new MUI imports
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add'; // For New Chat button
import EditIcon from '@mui/icons-material/Edit'; // For Rename Chat button
import DeleteIcon from '@mui/icons-material/Delete'; // For Delete Chat button
import { toast } from 'react-toastify'; // For notifications
import { UserContext } from '../UserContext'; // To get logged-in user info
import {
    ragQuery,
    createNewChat,
    getUserChats,
    getChatMessages,
    updateChatTitle,
    deleteChat
} from '../api/user'; // Import all new and modified API functions

const Messaging = () => { // Removed messages and setMessages props as they are now managed internally
    const { user, logout } = useContext(UserContext); // Get user and logout from context
    const [input, setInput] = useState("");
    const [chatSessions, setChatSessions] = useState([]); // List of chat sessions { _id, title, updatedAt }
    const [activeChatId, setActiveChatId] = useState(null); // ID of the currently active chat tab
    const [activeChatMessages, setActiveChatMessages] = useState([]); // Messages for the active chat
    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false); // To disable input during AI response

    // States for Rename/Delete Dialogs
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const bottomRef = useRef(null); // Ref for auto-scrolling chat history

    // --- Core Logic: Fetch Chat Sessions on Load ---
    useEffect(() => {
        const fetchChats = async () => {
            if (!user) {
                setChatSessions([]);
                setActiveChatId(null);
                setActiveChatMessages([]);
                return;
            }
            setIsLoadingChats(true);
            const result = await getUserChats();
            if (result.success) {
                setChatSessions(result.chats);
                if (result.chats.length > 0) {
                    // Set the most recently updated chat as active, or create new if no chats
                    const mostRecentChat = result.chats[0];
                    setActiveChatId(mostRecentChat._id);
                } else {
                    // If no chats, automatically create a new one
                    handleCreateNewChat();
                }
            } else {
                toast.error("Failed to load chats: " + result.message);
            }
            setIsLoadingChats(false);
        };

        fetchChats();
    }, [user]); // Re-fetch chats when user changes (login/logout)

    // --- Core Logic: Fetch Messages for Active Chat ---
    useEffect(() => {
        const fetchMessages = async () => {
            if (activeChatId) {
                setIsLoadingMessages(true);
                const result = await getChatMessages(activeChatId);
                if (result.success) {
                    setActiveChatMessages(result.messages);
                } else {
                    toast.error("Failed to load messages: " + result.message);
                    setActiveChatMessages([]);
                }
                setIsLoadingMessages(false);
            } else {
                setActiveChatMessages([]); // Clear messages if no active chat
            }
        };
        fetchMessages();
    }, [activeChatId]); // Re-fetch messages when active chat changes

    // Automatically scroll to the bottom of the list when new messages are added
    useEffect(() => {
        if (activeChatMessages.length > 0 && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeChatMessages]);

    // --- Chat Actions ---

    // Handle sending a message
    const handleSend = async () => {
        if (!input.trim() || !activeChatId) return;

        const userMessage = { sender: "user", content: input };
        // Optimistically update messages
        setActiveChatMessages(prev => [...prev, userMessage]);
        setInput(""); // Clear input immediately

        setIsSendingMessage(true); // Disable input and show loading
        const botThinkingMessage = { sender: "bot", content: "..." };
        setActiveChatMessages(prev => [...prev, botThinkingMessage]);

        try {
            const response = await ragQuery(userMessage.content, activeChatId); // Pass chatId
            if (response.success) {
                setActiveChatMessages(prev => {
                    const newMessages = [...prev.slice(0, -1), { sender: "bot", content: response.message }];
                    return newMessages;
                });
                // Update chat sessions list to reflect that this chat was recently updated
                setChatSessions(prevChats => {
                    const updatedChatIndex = prevChats.findIndex(chat => chat._id === activeChatId);
                    if (updatedChatIndex !== -1) {
                        const updatedChat = { ...prevChats[updatedChatIndex], updatedAt: new Date() };
                        const newChats = [...prevChats];
                        newChats.splice(updatedChatIndex, 1); // Remove old entry
                        newChats.unshift(updatedChat); // Add updated entry to top
                        return newChats;
                    }
                    return prevChats;
                });
            } else {
                toast.error("Bot response error: " + response.message);
                setActiveChatMessages(prev => prev.slice(0, -1)); // Remove "..." message
            }
        } catch (error) {
            console.error("Error sending message to RAG:", error);
            toast.error("Network error with chatbot.");
            setActiveChatMessages(prev => prev.slice(0, -1)); // Remove "..." message
        } finally {
            setIsSendingMessage(false); // Re-enable input
        }
    };

    // Handle creating a new chat session
    const handleCreateNewChat = async () => {
        if (!user) {
            toast.info("Please log in to create chats.");
            return;
        }
        setIsLoadingChats(true);
        const result = await createNewChat();
        if (result.success) {
            const newChat = result.chat;
            setChatSessions(prev => [newChat, ...prev]); // Add new chat to the top
            setActiveChatId(newChat._id); // Make it active
            toast.success("New chat created!");
        } else {
            toast.error("Failed to create new chat: " + result.message);
        }
        setIsLoadingChats(false);
    };

    // Handle changing active tab
    const handleChangeTab = (event, newValue) => {
        setActiveChatId(newValue);
    };

    // Handle opening rename dialog
    const handleOpenRenameDialog = () => {
        const activeChat = chatSessions.find(chat => chat._id === activeChatId);
        if (activeChat) {
            setNewChatTitle(activeChat.title); // Pre-fill with current title
        }
        setRenameDialogOpen(true);
    };

    // Handle renaming a chat
    const handleRenameChat = async () => {
        if (!newChatTitle.trim()) {
            toast.error("Chat title cannot be empty.");
            return;
        }
        if (!activeChatId) return;

        const result = await updateChatTitle(activeChatId, newChatTitle);
        if (result.success) {
            toast.success("Chat renamed successfully!");
            setChatSessions(prev =>
                prev.map(chat =>
                    chat._id === activeChatId ? { ...chat, title: result.chat.title } : chat
                ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Re-sort
            );
            setRenameDialogOpen(false);
        } else {
            toast.error("Failed to rename chat: " + result.message);
        }
    };

    // Handle opening delete dialog
    const handleOpenDeleteDialog = () => {
        setDeleteDialogOpen(true);
    };

    // Handle deleting a chat
    const handleDeleteChat = async () => {
        if (!activeChatId) return;

        const result = await deleteChat(activeChatId);
        if (result.success) {
            toast.success("Chat deleted successfully!");
            // Remove from chat sessions
            setChatSessions(prev => prev.filter(chat => chat._id !== activeChatId));
            // Set active chat to null or another chat if available
            if (chatSessions.length > 1) { // If other chats exist, switch to the first one
                setActiveChatId(chatSessions.filter(chat => chat._id !== activeChatId)[0]?._id || null);
            } else { // No other chats, create a new one
                setActiveChatId(null);
                setActiveChatMessages([]);
                handleCreateNewChat();
            }
            setDeleteDialogOpen(false);
        } else {
            toast.error("Failed to delete chat: " + result.message);
        }
    };

    return (
        <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#1e1e1e",
            color: "#fff",
            borderRadius: 3,
            boxShadow: 24,
            p: 2, // Reduced padding to give more space to content
            width: { xs: '95%', sm: '80%', md: '70%', lg: '60%' }, // Responsive width
            height: '80vh', // Fixed height for chat container
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>BoilerList Support Chatbot</Typography>

            {/* Chat Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', mb: 1 }}>
                <Tabs
                    value={activeChatId}
                    onChange={handleChangeTab}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="chat tabs"
                    sx={{
                        flexGrow: 1,
                        '& .MuiTabs-indicator': { backgroundColor: 'gold' },
                        '& .MuiTab-root': { color: 'white', '&.Mui-selected': { color: 'gold' } },
                    }}
                >
                    {isLoadingChats ? (
                        <Tab label={<CircularProgress size={20} color="inherit" />} disabled />
                    ) : (
                        chatSessions.map((chat) => (
                            <Tab key={chat._id} value={chat._id} label={
                                <Tooltip title={chat.title} placement="top">
                                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {chat.title}
                                    </span>
                                </Tooltip>
                            } />
                        ))
                    )}
                </Tabs>
                <Tooltip title="New Chat" placement="top">
                    <IconButton onClick={handleCreateNewChat} sx={{ color: 'gold' }} disabled={isLoadingChats}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
                {activeChatId && (
                    <>
                        <Tooltip title="Rename Chat" placement="top">
                            <IconButton onClick={handleOpenRenameDialog} sx={{ color: 'gold' }}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Chat" placement="top">
                            <IconButton onClick={handleOpenDeleteDialog} sx={{ color: 'red' }}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </Box>

            {/* Chat Messages Display Area */}
            <Box sx={{
                flexGrow: 1, // Allows this box to take up available space
                bgcolor: "#121212", // Darker background for message area
                color: "#fff",
                borderRadius: 2,
                p: 2,
                overflowY: "auto", // Scrollable message history
                mb: 2, // Margin before input
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end', // Stick messages to the bottom
            }}>
                {isLoadingMessages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress sx={{ color: 'gold' }} />
                    </Box>
                ) : (
                    <List sx={{ width: '100%', pt: 0 }}> {/* Removed mb: 1 from List */}
                        {activeChatMessages.map((msg, i) => (
                            <ListItem key={i} sx={{ justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", py: 0.5 }}>
                                <Box
                                    bgcolor={msg.sender === "user" ? "black" : "gold"}
                                    color={msg.sender === "user" ? "gold" : "black"}
                                    px={2}
                                    py={1}
                                    borderRadius={2}
                                    sx={{ maxWidth: '80%', wordBreak: 'break-word' }}
                                >
                                    {msg.content}
                                </Box>
                            </ListItem>
                        ))}
                        <div ref={bottomRef} /> {/* Scroll target */}
                    </List>
                )}
            </Box>

            {/* Message Input */}
            <Box display="flex" gap={1}>
                <TextField
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !isSendingMessage && handleSend()} // Prevent sending multiple times
                    fullWidth
                    size="small"
                    placeholder={activeChatId ? "Type a message..." : "Create a new chat first..."}
                    disabled={!activeChatId || isSendingMessage || isLoadingChats || isLoadingMessages} // Disable if no chat or sending
                    sx={{
                        backgroundColor: "white",
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'gold' },
                            '&:hover fieldset': { borderColor: 'gold' },
                            '&.Mui-focused fieldset': { borderColor: 'gold' },
                        },
                        '& .MuiInputBase-input': { color: 'black' },
                    }}
                />
                <Button
                    onClick={handleSend}
                    variant="contained"
                    disabled={!activeChatId || isSendingMessage || isLoadingChats || isLoadingMessages}
                    sx={{
                        backgroundColor: "gold", color: "black", fontWeight: "bold",
                        "&:hover": { backgroundColor: "#e6c200" }
                    }}
                >
                    {isSendingMessage ? <CircularProgress size={24} sx={{ color: 'black' }} /> : <SendIcon />}
                </Button>
            </Box>

            {/* Rename Chat Dialog */}
            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} PaperProps={{
                style: { backgroundColor: "#1e1e1e", color: "white", borderRadius: "8px", boxShadow: "0 0 15px rgba(255,215,0,0.2)" },
            }}>
                <DialogTitle sx={{ color: "#FFD700" }}>Rename Chat</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Chat Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newChatTitle}
                        onChange={(e) => setNewChatTitle(e.target.value)}
                        sx={{
                            '& .MuiInputBase-input': { color: 'white' },
                            '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#FFD700' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } },
                            '& .MuiInputLabel-root': { color: '#FFD700' },
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameDialogOpen(false)} sx={{ color: '#FFD700' }}>Cancel</Button>
                    <Button onClick={handleRenameChat} sx={{ backgroundColor: "#FFD700", color: "#000", fontWeight: "bold", "&:hover": { backgroundColor: "#e6c200" } }}>Rename</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Chat Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{
                style: { backgroundColor: "#1e1e1e", color: "white", borderRadius: "8px", boxShadow: "0 0 15px rgba(255,215,0,0.2)" },
            }}>
                <DialogTitle sx={{ color: "error.main" }}>Delete Chat?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "#ccc" }}>
                        Are you sure you want to delete this chat session? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#FFD700' }}>Cancel</Button>
                    <Button onClick={handleDeleteChat} color="error" autoFocus sx={{ fontWeight: "bold" }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Messaging;
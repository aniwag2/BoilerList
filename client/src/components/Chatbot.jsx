import {useState, useContext, useEffect} from 'react';
import { UserContext } from '../UserContext';
import ChatIcon from '@mui/icons-material/Chat';
import {Fab, Modal} from '@mui/material';
import Messaging from './Messaging';


const Chatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const {user} = useContext(UserContext);

    useEffect(() => {
        if (!user) {
            setMessages([]);
        }
    }, [user]);


    const handleOpen = () => {
        setOpen(true);
    }
    
    const handleClose = () => {
        setOpen(false);
    }

    return (
    <>
        <Fab
            color="primary"
            sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300, color: "black", backgroundColor: "gold" }}
            onClick={handleOpen}
        >
            <ChatIcon />
        </Fab>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Messaging messages={messages} setMessages={setMessages} />
            
        </Modal>
    </>
    );
};


export default Chatbot;

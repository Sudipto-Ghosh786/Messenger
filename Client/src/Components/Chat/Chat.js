import React, {useState, useEffect, useRef} from 'react';
import queryString from 'query-string';
import { socket } from '../socket';

import { TextField, Button, IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import SendIcon from '@material-ui/icons/Send';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';


import Messagebubble from './Messagebubble';
import Start from '../Loading/Start';
import Friendbubble from './Friendbubble';


import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';


function Chat() {
	const [name, setName] = useState('');
	const [number, setNumber] = useState('');
	const [userObject, setUserObject] = useState('');
	const [friendList, setFriendList] = useState([]);


	const [selectedFriend, setSelectedFriend] = useState('');
	const [conversation, setConversation] = useState([]);


	const [typedMessage, setTypedMessage] = useState('');
	const [selectedDiv, setSelectedDiv] = useState(null);


	
	const sidebarClass = useRef(null);
	const messageContainerClass = useRef(null)
	const canvas = useRef(null);
	const textRef = useRef(null);

	const messageEndRef = useRef(null);


	const [showEmojiBox, setShowEmojiBox] = useState(false);

	const [selectionPosition, setselectionPosition] = useState(0);

	const {userName, userNumber} = queryString.parse(window.location.search);
	socket.userId = userNumber;



	useEffect( () => {
		setName(userName);
		setNumber(userNumber);
		socket.emit('userCheckin', { name: userName, number: userNumber });
		socket.on('userUpdateAfterCheckin', (updatedUser) => {
			setUserObject(updatedUser);
			setFriendList(updatedUser.friends);
		})
	}, [userName])


	//add friend

	const addNewFriend = (e) => {
		e.preventDefault();
		const friendNumber = e.target.children[0].value;
		if(friendNumber === number) {
			return;
		}
		for(let i = 0;i < friendList.length;i++) {
			if(friendList[i].number === friendNumber) {
				return;
			}
		}
		socket.emit('addFriend', {friendNumber, userNumber: number});
	}


	socket.off('AddedNewFriendInServer').on('AddedNewFriendInServer', (updatedUser) => {
		setUserObject(updatedUser);
		setFriendList(updatedUser.friends);
	})


	socket.off('GotNewFriend').on('GotNewFriend', (updatedUser) => {
		setUserObject(updatedUser);
		setFriendList(updatedUser.friends);
	} )

	socket.off('friendNotFound').on('friendNotFound', () => {
		alert("FRIEND NOT FOUND !");
	})


	const selectingFriend = (friend) => {
		socket.emit('getMessageOfSelectedFriend', {userNumber: userObject.number, friendNumber: friend.number});
		setSelectedFriend(friend);
	}


	socket.off('messageArrayFromServer').on('messageArrayFromServer', message => {
		setConversation(message);
	})


	//image setup in server
	socket.off('ImageSettedInServer').on('ImageSettedInServer', ({newFriendsList}) => {
		 setFriendList(newFriendsList);
	})


/************   RED FLAG    ******/

	const encrypt = (m) => {
		let temp = '';
		for(let i = 0;i < m.length;i++) {
			let ch = m[i];
			ch = ch + 1;
			temp = temp + ch;
		}
		return m;
	} 
	const decrypt = (m) => {
		let temp = '';
		for(let i = 0;i < m.length;i++) {
			let ch = m[i];
			ch = ch - 1;
			temp = temp + ch;
		}
		return m;
	}


	const sendMessageToFriend = (e) => {
		e.preventDefault();
		if(textRef !== null) {
			textRef.current.children[0].children[0].value = '';
		}
		if(typedMessage === '' || typedMessage === null) {
			return;
		}
		const senderName = userObject.name;
		let tempM = typedMessage;
		const h = new Date().getHours();
		const m = new Date().getMinutes();
		const reqMes = encrypt(tempM);
		const msg = {message: reqMes, sender: senderName !== '' ? senderName : name, hours: h, minutes: m};
		setConversation([...conversation, msg]);

		socket.emit('sendMessage', {userNumber: userObject.number, friendNumber: selectedFriend.number, msg});
	}
	socket.off('messageSent').on('messageSent', userDetail => {
		setUserObject(userDetail);
		setFriendList(userDetail.friends);
	})
	socket.off('messageFromServer').on('messageFromServer', ({senderNumber, msg}) => {
		if(selectedFriend !== '' && selectedFriend.number === senderNumber) {
			setConversation([...conversation, msg]);
		}
	})

/*************************************/

	//user Image
	const handleUserImage = (e) => {
		const imgData = e.target.files[0];
		if(imgData.size > 100000) {
			alert('Image is too large !');
			return;
		}
		const fr = new FileReader();
		fr.onload = () => createImage(fr);
		fr.readAsDataURL(imgData);
	}
	const createImage = (fr) => {
		const img = new Image();
		img.onload = () => imageLoaded(img);
		img.src = fr.result;
	}
	const imageLoaded = (img) => {
		const pen = document.querySelector('canvas').getContext('2d');
		pen.drawImage(img, 0, 0);
		socket.emit('setImage', {userNumber: userObject.number, img: img.src});
	}


	const enlargeImage = (e) => {
		e.target.classList.toggle('enlarge-image');
	}


	const friendItemAddition = (e, friend) => {
		if(e.target.className !== 'friend-bubble') {
			return;
		}
		setConversation([]);
		if(messageContainerClass !== null && messageContainerClass.current !== null) {
			messageContainerClass.current.classList.remove('toggle-message-container-back')
			messageContainerClass.current.classList.add('toggle-message-container');
		}
		e.target.parentNode.style.backgroundColor="#444";
		setSelectedDiv(preSelectedDiv => {
			if(preSelectedDiv !== null) {
				preSelectedDiv.style.backgroundColor = '#090e11';
			}
			return e.target.parentNode;
		})
		selectingFriend(friend);
	}




	//add Emoji
	function toogleEmojiBox() {
		setShowEmojiBox(!showEmojiBox);
		scrollToBottom();
	}


	/*TESTING*/

	useEffect(() => {
		scrollToBottom();
	}, [conversation, showEmojiBox]);

	const scrollToBottom = () => {
		if(messageEndRef !== null && messageEndRef.current !== null)  {
			messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
		}
	}

	const addEmoji = e => {
		let newMessage = typedMessage.slice(0, selectionPosition) + e.native + typedMessage.slice(selectionPosition, typedMessage.length);
		document.getElementById('text-area').value = newMessage;
		setTypedMessage(newMessage);
	}


	return (
		<div className='chat-container'>


			<div className='chat-sidebar' ref={ sidebarClass }>
				
				<div className='chat-sidebar-header'>
					<canvas width='0px' height = '0px' ref={canvas} style={{backgroundColor: 'black', display: 'none'}}></canvas>
					<Button label="Choose file" labelPosition="before">
					  <input type="file" accept='image/*' onChange={ handleUserImage } content=''/>
					</Button>
					
					<div 
						className='message-image' 
						style={{backgroundImage: `url(${userObject.img})`}} 
						onClick={ enlargeImage }
						></div>

					<div className='detail-wrapper'>
						<h1 style={ { margin: '0' } }>{userObject.name !== ''  ? userObject.name : name}</h1>
						<div>{number}</div>
					</div>
				</div>
					
				{
					friendList.map( (friend, index) => {
						return (
							<div
							key = { index }
							className = "friend-item"
							onClick =  {
								(e) => friendItemAddition(e, friend)
							}
							>
								<Friendbubble img={friend.img} name={friend.name}/>	
							</div>
						)
					} )
				}
				
				<form className='friend-adder-form' action="FriendNumber" onSubmit = { (e) => { addNewFriend(e) } } >
					<input type="text" name="text" id="text"/>
					
					<Button
						type='submit'
						variant='contained'
						color='secondary'
						startIcon={<AddIcon />}
					>
						Add Friend	
					</Button>
				</form>
			</div>

			

			{	
				selectedFriend === '' && window.innerWidth > 707? <Start userName={name} /> : (
					<div className='chat-message-container' ref = {messageContainerClass}>
						<div className='toggler' 
							onClick={ (e) => {
								messageContainerClass.current.classList.remove('toggle-message-container')
								messageContainerClass.current.classList.add('toggle-message-container-back');
							}}
						>
							<AddIcon />
							CLICK !
						</div>	
						<div className='chat-message-box' ref = {messageEndRef}>		
{/*************************************************/}
							<div>
							{
								conversation.map( (msg, index) => {
									const req = decrypt(msg.message);
									return (
										<Messagebubble key={index} img={msg.sender === name ? (userObject.img) : (selectedFriend.img)} hours={msg.hours} minutes={msg.minutes >= 0 && msg.minutes <= 9 ? "0" + msg.minutes : msg.minutes} user={name} sender={msg.sender} message={req}/>
									)
								} )
							}
							</div>

{/**********************************************************/}
							<span>
								{showEmojiBox? 
									<div className='emoji-picker'>
										<Picker onSelect={addEmoji}/>
									</div> 
									: 
									<div className='emoji-picker-display'>
										<Picker />
									</div>
								}
							</span>
						</div>
						<div className='chat-message-footer'>

							<div className='emoji-box'>
								<IconButton color = 'secondary' size='medium' onClick = {toogleEmojiBox}>
									{<EmojiEmotionsIcon size="medium"/>}
								</IconButton>
							</div>
							<div className='message-box'>
								<form action="message" onSubmit = { (e) => {
									//send message
									sendMessageToFriend(e);
								} }>
									<TextField 
										ref = {textRef}
										id='text-area'
										color='secondary' 
										variant='outlined' 
										placeholder='Enter your message'
										fullWidth
										onKeyUp={(e) => {
											if(e) {
												setselectionPosition(e.target.selectionStart);
											}
										}}
										onChange={(e) => {
											setTypedMessage(e.target.value);
										}}

									/>
									<IconButton type='submit' variant='contained' color='secondary' size='medium'>
										<SendIcon />
									</IconButton>
								</form>
							</div>
						</div>
					</div>
				)
			}
		</div>
	)
} 

export default Chat;
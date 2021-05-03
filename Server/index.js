const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer( app );

const io = require('socket.io')(server);
const cors = require('cors');


const router = require('./router')

const STATIC_CHANNELS = ['global_notifications', 'global_chat'];

const users = [];

const mapId = {};


// const PORT = process.env.PORT || 8080;
const PORT = 8080;

app.use(router);
app.use(cors());

const checkForUser = (number) => {
	for(let i = 0;i < users.length;i++) {
		if(users[i].number === number) {
			return users[i];
		}
	}
	return null;
}





//Adding friend A to friend B

const setFriendAToB = (userObject, friendObject) => {
	for(let i = 0;i < users.length;i++) {
		if(users[i].number === userObject.number) {
			users[i].friends.push({ name: friendObject.name, number: friendObject.number, img: friendObject.img, messages: [] });
			return users[i];
		}
	}
}




//Sending message from friend A to friend B

const setMessageAToB = (userNumber, friendNumber, msg) => {

	for(let i = 0; i < users.length;i++) {
		if(users[i].number === userNumber) {
			for(let j = 0;j < users[i].friends.length;j++) {
				if(users[i].friends[j].number === friendNumber) {
					users[i].friends[j].messages.push(msg);
					return users[i];
				}
			}
		}
	}
}



//Getting friend's messages to display

const getMessage = (userNumber, friendNumber) => {
	for(let i = 0;i < users.length;i++) {
		if(users[i].number === userNumber) {
			for(let j = 0;j < users[i].friends.length;j++) {
				if(users[i].friends[j].number === friendNumber) {
					return users[i].friends[j].messages;
				}
			}
			break;
		}
	}
}


//setting image to user and friend
const setImageInUserAndFriends = (userNumber, img) => {
	const numberMap = {};
	for(let i = 0;i < users.length;i++) {
		if(users[i].number === userNumber) {
			users[i].img = img;
			for(let j = 0;j < users[i].friends.length;j++) {
				numberMap[users[i].friends[j].number] = 1;
			}
			break;
		}
	}
	for(let i = 0;i < users.length;i++) {
		if(numberMap[users[i].number] === 1) {
			for(let j = 0;j < users[i].friends.length;j++) {
				if(users[i].friends[j].number === userNumber) {
					users[i].friends[j].img = img;
				}
			}
		}
	}
	return numberMap;
}


io.on('connection', socket => {

	console.log('USER CONNECTED !');

	//User Checkin
	socket.on('userCheckin', ( {name, number} ) => {

		mapId[number] = socket.id;
		
		let userDetail = checkForUser(number);

		if(userDetail === null) {
			userDetail = { name: name, number: number, img: null, friends: [] };
			users.push(userDetail);
		}
		socket.emit('userUpdateAfterCheckin', userDetail);
	} )


	//adding friend
	socket.on('addFriend', ( {friendNumber, userNumber} ) => {
		const friendObject = checkForUser(friendNumber);
		const userObject = checkForUser(userNumber);

		if(friendObject === null) {
			socket.emit("friendNotFound");
		}
		else {
			const updatedUser = setFriendAToB(userObject, friendObject);		
			const updatedFriend = setFriendAToB(friendObject, userObject);

			socket.emit('AddedNewFriendInServer', updatedUser);
			socket.to(mapId[updatedFriend.number]).emit('GotNewFriend', updatedFriend);
		}
	})



	//selectFriend
	socket.on('getMessageOfSelectedFriend', ({userNumber, friendNumber}) => {
		const message = getMessage(userNumber, friendNumber);
		socket.emit('messageArrayFromServer', message);
	} )


	//send message
	socket.on('sendMessage', ({userNumber, friendNumber, msg}) => {
		const userDetail = setMessageAToB(userNumber, friendNumber, msg);
		const friendDetail = setMessageAToB(friendNumber, userNumber, msg);
		
		socket.emit('messageSent', userDetail);
		socket.to(mapId[friendDetail.number]).emit('messageFromServer', {senderNumber: userDetail.number, msg});
	})


	//set image reciever
	socket.on('setImage', ({userNumber, img}) => {
		const userNumberObject = setImageInUserAndFriends(userNumber, img);
		for(let key of Object.keys(userNumberObject)) {
			const user = checkForUser(key);

			socket.to(mapId[user.number]).emit('ImageSettedInServer', { newFriendsList: user.friends });
		}
	})
})




server.listen(PORT, () => {
	console.log('Server listning !');
	console.log('\n');
});



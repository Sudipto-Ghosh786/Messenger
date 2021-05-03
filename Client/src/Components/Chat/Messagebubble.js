import React from 'react';

export default function Messagebubble(props) {
	return (
		<div className={`message ${props.user === props.sender ? "sender": "reciever"}`}>
			<div className='message-image' style={{ backgroundImage: `url(${props.img})` }}/>

			<div className={`message-bubble ${props.user === props.sender ? "sender-config": "reciever-config"}`}>
				<div className='message-info'>
					<div className='message-info-name'>{ props.sender }</div>
					<div className='message-info-time'>{ Math.floor(props.hours / 10) === 0? ('0' + props.hours) : (props.hours) } : {props.minutes}</div>
				</div>
				<div className='message-body'>{props.message}</div>
			</div>

		</div>
	)
}  
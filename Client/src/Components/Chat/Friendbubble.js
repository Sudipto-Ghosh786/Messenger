import React from 'react';

export default function Friendbubble(props) {
	const enlargeImage = (e) => {
		e.target.classList.toggle('enlarge-image');
	}
	return (
		<div className='friend-bubble'>
			<div className='message-image' style={{backgroundImage: `url(${props.img})`}} onClick={ enlargeImage }>

			</div>
			<div className='friend-name'>{ props.name }</div>
		</div>
	)
}
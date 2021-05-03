import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { TextField, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import PhoneIcon from '@material-ui/icons/Phone';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';

const styles = theme => ({
	textField: {
	    width: '100%',
	},
	cssLabel: {
	    color : 'white'
	},

	cssOutlinedInput: {
	    '&$cssFocused $notchedOutline': {
	      borderColor: `${theme.palette.primary.main} !important`,
	    }
	},

	cssFocused: {
		color: 'white'
	
	},

	notchedOutline: {
	    borderWidth: '1px',
	    borderColor: 'white !important',
	    opacity: '0.2'
	},
})


const icons = {
	PhoneIcon: PhoneIcon,
	UserIcon: PersonOutlineIcon
}

const FieldIcon = ( {name} ) => {
	const Icon = icons[name];
	return Icon ?  (<Icon style={{ fill: '#00af9c' }} />) : null;
}



function Join(props) {
	const [userName, setuserName] = useState('');
	const [userNumber, setuserNumber] = useState(''); 

	const { classes } = props 
	return (
		<div class='login-page'>

			{/*LOGIN BOX*/}

			<div class='login-box'>
				

				<div className='heading-container'>
					<h1>LOGIN</h1>
				</div>
				
				{/*USER NAME*/}

				<div style={{ margin: "20px" }}>
					<TextField 
						autoComplete='off'
						id='outlined-basic' 
						variant='outlined' 
						label='Username' 
						color='secondary'
						className={ classes.textField }
						InputLabelProps={{
				            classes: {
				              root: classes.cssLabel,
				              focused: classes.cssFocused,
				            },
				        }}
				        InputProps={{
				            classes: {
				              root: classes.cssOutlinedInput,
				              focused: classes.cssFocused,
				              notchedOutline: classes.notchedOutline,
				            },
				            inputMode: "numeric",
				            endAdornment: (
				            	<FieldIcon name={'UserIcon'}/>
				            )
				        }}
				        onChange = {
				        	(e) => {
				        		setuserName(e.target.value);
				        	}
				        }
					/>
				</div>

				{/*PHONE NUMBER*/}
				<div style={{ margin: "20px" }}>
					<TextField 
						autoComplete='off'
						id='outlined-basic' 
						variant='outlined' 
						label='Number' 
						color='secondary'
						className={ classes.textField }
						InputLabelProps={{
				            classes: {
				              root: classes.cssLabel,
				              focused: classes.cssFocused,
				            },
				        }}
				        InputProps={{
				            classes: {
				              root: classes.cssOutlinedInput,
				              focused: classes.cssFocused,
				              notchedOutline: classes.notchedOutline,
				            },
				            inputMode: "numeric",
				            endAdornment: (
				            	<FieldIcon name={'PhoneIcon'}/>
				            )
				        }}
				        onChange = {
				        	(e) => {
				        		setuserNumber(e.target.value);
				        	}
				        }
					/>
				</div>

				
				
				{/*SUBMIT BUTTON*/}

				<div className='submit-button' style={{ margin: "30px" }}>
					<Link style={{ margin: '0px', padding: '0px' }} onClick={ (e) => (!userName || !userNumber) ? e.preventDefault() : null } to={`/chat?userName=${userName}&userNumber=${userNumber}`}>
						<a href="#">
					        <span></span>
					        <span></span>
					        <span></span>
					        <span></span>
					        TAKE ME IN
						</a>
					</Link>
				</div>


			</div>
		</div>
	)
} 

Join.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Join);
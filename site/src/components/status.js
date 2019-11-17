import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Blur from '@material-ui/icons/BlurOn';

const useStyles = makeStyles({
    default: {
        // margin: 10,
        width: "48px",
        height: "48px",
        backgroundImage: "linear-gradient(180deg, #1976d2 0%, #0d47a1 100%)"
    },
    pinkAvatar: {
        // margin: 10,
        width: "48px",
        height: "48px",
        color: '#fff',
        backgroundImage: "linear-gradient(180deg, #ffa726 0%, #f57c00 100%)"
        // backgroundColor: pink[500],
    },
    greenAvatar: {
        // margin: 10,
        width: "48px",
        height: "48px",
        color: '#fff',
        backgroundImage: "linear-gradient(180deg, #66bb6a 0%, #43a047 100%)"
        // backgroundColor: green[500],
    },
});

export const IconAvatars = props => {
    const classes = useStyles();

    return (
        <>
            {props.status === "good" && <Avatar className={classes.greenAvatar}>
                <Check />
            </Avatar>}
            {props.status === "bad" && <Avatar className={classes.pinkAvatar}>
                <Close />
            </Avatar>}
            {props.status === "default" &&
                <Avatar className={classes.default}>
                    <Blur />
                </Avatar>}
        </>
    );
}
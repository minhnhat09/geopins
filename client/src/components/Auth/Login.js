import React, { useContext } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { GoogleLogin } from 'react-google-login';
import { GraphQLClient } from 'graphql-request';
import { ME_QUERY } from '../../graphql/queries';
import Context from '../../context';

const Login = ({ classes }) => {
  const { dispatch } = useContext(Context);
  const onFailure = error => {
    console.error(error);
  };
  const onSuccess = async googleUser => {
    try {
      const idToken = googleUser.getAuthResponse().id_token;
      const client = new GraphQLClient('http://localhost:4000/graphql', {
        headers: { authorization: idToken },
      });
      const { me } = await client.request(ME_QUERY);
      dispatch({ type: 'LOGIN_USER', payload: me });
      dispatch({ type: 'IS_LOGGED_IN', payload: googleUser.isSignedIn() });
    } catch (error) {
      onFailure(error);
    }
  };

  return (
    <div className={classes.root}>
      <Typography
        component="h1"
        variant="h3"
        gutterBottom
        noWrap
        style={{ color: 'rgb(66, 133, 244)' }}
      >
        Welcome
      </Typography>
      <GoogleLogin
        clientId="784634270654-0asamshe3b3vfrk2bkjfa0rq5gvfvnoq.apps.googleusercontent.com"
        onSuccess={onSuccess}
        onFailure={onFailure}
        isSignedIn
        buttonText="Login with Google"
        theme="dark"
      />
    </div>
  );
};

const styles = {
  root: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

export default withStyles(styles)(Login);

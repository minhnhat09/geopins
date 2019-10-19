import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { GoogleLogin } from 'react-google-login';
import { GraphQLClient } from 'graphql-request';
import { ME_QUERY } from '../../graphql/queries';

const Login = ({ classes }) => {
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
    } catch (error) {
      onFailure(error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onFailure={onFailure}
      clientId="784634270654-0asamshe3b3vfrk2bkjfa0rq5gvfvnoq.apps.googleusercontent.com"
      isSignedIn
    />
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

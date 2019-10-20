/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useContext } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/DeleteTwoTone';
import ReactMapGL, { NavigationControl, Marker, Popup } from 'react-map-gl';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import PinIcon from './PinIcon';
import Context from '../context';
import Blog from './Blog';
import { useClient } from '../client';
import { GET_PINS_QUERY } from '../graphql/queries';
import { DELETE_PIN_MUTATION } from '../graphql/mutations';

const INITIAL_VIEWPORT = {
  latitude: 48.81333923736466,
  longitude: 2.2793228312542775,
  zoom: 13,
};
const Map = ({ classes }) => {
  const client = useClient();
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [userPosition, setUserPosition] = useState(null);

  const { state, dispatch } = useContext(Context);
  useEffect(() => {
    getUserPosition();
  }, []);
  const getUserPosition = () => {
    if ('geolocation' in navigator) {
      console.log(navigator);
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setViewport({ ...viewport, latitude, longitude });
        setUserPosition({ latitude, longitude });
      });
    }
  };

  useEffect(() => {
    getPins();
  }, []);
  const getPins = async () => {
    const { getPins } = await client.request(GET_PINS_QUERY);
    dispatch({ type: 'GET_PINS', payload: getPins });
  };

  const highlightNewPin = pin => {
    const isNewPin = differenceInMinutes(Date.now(), Number(pin.createdAt)) <= 30;
    return isNewPin ? 'limegreen' : 'darkblue';
  };

  const handleSelectPin = pin => {
    setPopup(pin);
    dispatch({ type: 'SET_PIN', payload: pin });
  };

  const handleMapClick = ({ lngLat, leftButton }) => {
    if (!leftButton) return;
    if (!state.draft) {
      dispatch({ type: 'CREATE_DRAFT' });
    }
    const [longitude, latitude] = lngLat;
    dispatch({
      type: 'UPDATE_DRAFT_LOCATION',
      payload: { longitude, latitude },
    });
  };
  const [popup, setPopup] = useState(null);
  // remove popup if pin itself is deleted by the author of the pin
  useEffect(() => {
    const pinExists = popup && state.pins.findIndex(pin => pin._id === popup._id) > -1;
    if (!pinExists) {
      setPopup(null);
    }
  }, [state.pins.length]);

  const isAuthUser = () => state.currentUser._id === popup.author._id;

  const handleDeletePin = async pin => {
    const variables = { pinId: pin._id };
    await client.request(DELETE_PIN_MUTATION, variables);
    setPopup(null);
  };

  return (
    <div className={classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken="pk.eyJ1IjoibWluaG5oYXQwOSIsImEiOiJjazFlcW83bG0wazY4M2psbTVoMGkxNHJrIn0.ct4HmPBekg3vEk737vffLw"
        onViewportChange={newViewport => setViewport(newViewport)}
        {...viewport}
        onClick={handleMapClick}
      >
        <div className={classes.navigationControl}>
          <NavigationControl onViewportChange={newViewport => setViewport(newViewport)} />
        </div>
        {userPosition && (
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon size={40} color="red" />
          </Marker>
        )}
        {/* Draft Pin */}
        {state.draft && (
          <Marker
            latitude={state.draft.latitude}
            longitude={state.draft.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon size={40} color="hotpink" />
          </Marker>
        )}
        {/* Created Pins */}
        {state.pins.map(pin => (
          <Marker
            key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon onClick={() => handleSelectPin(pin)} size={40} color={highlightNewPin(pin)} />
          </Marker>
        ))}
        {/* Popup Dialog for Created Pins */}
        {popup && (
          <Popup
            anchor="top"
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <img className={classes.popupImage} src={popup.image} alt={popup.title} />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(6)}, {popup.longitude.toFixed(6)}
              </Typography>
              {isAuthUser() && (
                <Button onClick={() => handleDeletePin(popup)}>
                  <DeleteIcon className={classes.deleteIcon} />
                </Button>
              )}
            </div>
          </Popup>
        )}
      </ReactMapGL>
      {/* Blog Area to add Pin Content */}
      <Blog />
    </div>
  );
};

const styles = {
  root: {
    display: 'flex',
  },
  rootMobile: {
    display: 'flex',
    flexDirection: 'column-reverse',
  },
  navigationControl: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: '1em',
  },
  deleteIcon: {
    color: 'red',
  },
  popupImage: {
    padding: '0.4em',
    height: 200,
    width: 200,
    objectFit: 'cover',
  },
  popupTab: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
};

export default withStyles(styles)(Map);

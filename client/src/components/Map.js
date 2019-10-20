/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect, useContext } from 'react';
import { withStyles } from '@material-ui/core/styles';
// import Button from "@material-ui/core/Button";
// import Typography from "@material-ui/core/Typography";
// import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
import ReactMapGL, { NavigationControl, Marker } from 'react-map-gl';
import PinIcon from './PinIcon';
import Context from '../context';

const INITIAL_VIEWPORT = {
  latitude: 48.81333923736466,
  longitude: 2.2793228312542775,
  zoom: 13,
};
const Map = ({ classes }) => {
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
      </ReactMapGL>
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

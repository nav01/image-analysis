import React, { Component } from 'react';

import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/logo/Logo';
import Navigation from './components/navigation/Navigation';
import Particles from 'react-particles-js';
import Rank from './components/rank/Rank';
import Register from './components/register/Register';
import SignIn from './components/signin/SignIn';
import Modal from './components/modal/Modal';
import Profile from './components/profile/Profile';
import {cFetchToJson} from './customFetch';
import {ROUTES, SESSION_TOKEN} from './constants';

import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 300,
      density: {
        enable: true,
        value_area: 2000
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  boxes: [],
  route: ROUTES.SIGNIN,
  isSignedIn: false,
  isProfileOpen: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
  },
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    cFetchToJson(`${process.env.REACT_APP_BACKEND_URL}/signin`, 'post', true)
    .then(userId => {
      if (userId && userId.id)
        cFetchToJson(`${process.env.REACT_APP_BACKEND_URL}/profile/${userId.id}`, 'get', true)
        .then(user => {
            if (user) {
              this.loadUser(user)
              this.onRouteChange(ROUTES.HOME);
            }
        })
    })
    .catch(err => console.log(err.toString()));
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined,
    }});
  }

  calculateFaceLocations = (data) => {
    if (data && data.outputs) {
      const faces = data.outputs[0].data.regions; //[0].region_info.bounding_box;
      const image = document.getElementById('inputImage');
      const width = Number(image.width);
      const height = Number(image.height);
      return faces.map((f, i) => {
        let face = f.region_info.bounding_box;
        return {
          key: i,
          left: face.left_col * width,
          topRow: face.top_row * height,
          right: width - (face.right_col * width),
          bottomRow: height - (face.bottom_row * height),
        };
      });
    }
  }

  displayFaceBoxes = (boxes = null) => {
    if (boxes)
      this.setState({boxes})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  };

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    let body = {input: this.state.input};
    console.log(body);
    cFetchToJson(`${process.env.REACT_APP_BACKEND_URL}/imageurl`, 'post', true, body)
    .then(response => {
      if (response) {
        let body = {id: this.state.user.id};
        cFetchToJson(`${process.env.REACT_APP_BACKEND_URL}/image`, 'put', true, body)
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log);
      }
      this.displayFaceBoxes(this.calculateFaceLocations(response))
    })
    .catch( err => console.log(err));
  };

  signout = () => {
    cFetchToJson(`${process.env.REACT_APP_BACKEND_URL}/signout`, 'post', true)
    .then(logout => {
      if (logout.success) {
        window.localStorage.removeItem(SESSION_TOKEN);
        return this.setState(initialState);
      }
    })
    .catch(err => alert('Problem signing out. You may already be signed out. Refresh the page or try again.'))
  }

  onRouteChange = (route) => {
    if (route === ROUTES.SIGNOUT) {
      return this.signout();
    } else if (route === ROUTES.HOME) {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  toggleModal = () => {
    this.setState(prevState => ({
      isProfileOpen: !prevState.isProfileOpen
    }));
  }

  render() {
    return (
      <div className="App">
      <Particles className='particles'
            params={particlesOptions}
        />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} toggleModal={this.toggleModal}/>
          {this.state.isProfileOpen &&
            <Modal>
              <Profile 
                user={this.state.user} 
                isProfileOpen={this.state.isProfileOpen} 
                toggleModal={this.toggleModal} 
                loadUser={this.loadUser} />
              {'Hello'}
            </Modal>
          }
        { this.state.route === ROUTES.HOME
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
            <FaceRecognition boxes={this.state.boxes} imageUrl={this.state.imageUrl}/>
            </div>
          : (
              this.state.route === ROUTES.SIGNIN
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }
}

export default App;

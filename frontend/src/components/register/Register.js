import React from 'react'

import {cFetchToJson} from '../../customFetch';
import {ROUTES, SESSION_TOKEN} from '../../constants';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      name: '',
    }
  }

  onEmailChange = (event) => {
    this.setState({email: event.target.value})
  };

  onPasswordChange = (event) => {
    this.setState({password: event.target.value});
  };

  onNameChange = (event) => {
    this.setState({name: event.target.value})
  };

  onSubmitRegister = () => {
    const body = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
    }
    cFetchToJson(`${process.env.REACT_APP_BACKEND_URL}/register`, 'post', false, body)
    .then(user => {
      if (user.id) {
        window.localStorage.setItem(SESSION_TOKEN, user.token);
        this.props.loadUser(user);
        this.props.onRouteChange(ROUTES.HOME);
      }
    })
  };

  render() {
    return (
      <article className='br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center flex-center'>
        <main className="pa4 black-80">
          <div className="measure">
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend className="f1 fw6 ph0 mh0">Register</legend>
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="name">Name</label>
                <input
                  onChange={this.onNameChange}
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="text"
                  name="name"
                />
              </div>
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                <input
                  onChange={this.onEmailChange}
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="email"
                  name="email-address"
                  id="email-address"
                />
              </div>
              <div className="mv3">
                <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                <input
                  onChange={this.onPasswordChange}
                  className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="password"
                  name="password"
                  id="password"
                />
              </div>
            </fieldset>
            <div className="">
              <input
                onClick={this.onSubmitRegister}
                className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                type="submit"
                value="Register"/>
            </div>
          </div>
        </main>
      </article>
    );
  }
};

export default Register;

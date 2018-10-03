import React from 'react';
import './Profile.css'

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.user.name,
    }
  }

  onFormChange = (event) => {
    if (event.target.name === 'name')
      this.setState({name: event.target.value})
  }

  updateUser = (data) => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/profile/${this.props.user.id}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': window.localStorage.getItem('token'),
      },
      body: JSON.stringify(data)
    }).then(resp => {
      if (resp.status === 200 || resp.status === 304){
        this.props.toggleModal();
        this.props.loadUser({...this.props.user, ...data})
      }
    }).catch(console.log);
  }

  render() {
    const {user} = this.props;
    const {name} = this.state;
    return (
      <div className='profile-modal'>
        <article className='br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center flex-center bg-white'>
          <main className="pa4 black-80 w-80">
            <img
              src='http://tachyons.io/img/logo.jpg'
              className='br-100 ba h3 w3 dib' alt='avatar'
            />
            <h1>{this.state.name}</h1>
            <h4>Images Submitted: {user.entries}</h4>
            <p>Member since: {user.joined}</p>
            <label className="mt2 fw6" htmlFor="user-name">Username</label>
            <input
              onChange={this.onFormChange}
              className="pa2 ba w-100"
              placeholder={user.name}
              type="text"
              name="name"
              id="name"
            />
            <div className='mt4 profile-buttons'>
              <button onClick={() => this.updateUser({name})} className='b pa2 grow pointer hover-white w-40 bg-light-blue b--black-20'>
                Save
              </button>
              <button className='b pa2 grow pointer hover-white w-40 bg-light-red b--black-20'
                onClick={this.props.toggleModal}>
                Cancel
              </button>
            </div>
          </main>
          <div className='modal-close' onClick={this.props.toggleModal}>&times;</div>
        </article>
      </div>
    );
  }
}

export default Profile;

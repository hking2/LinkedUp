import React, { useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getCurrentProfile, deleteAccount } from '../../actions/profile';
import DashActions from './DashActions';
import Experience from './Experience';
import Education from './Education';
import PropTypes from 'prop-types';

const Dashboard = ({ 
  getCurrentProfile, 
  deleteAccount,
  auth: { user }, 
  profile: { profile } }) => {
  useEffect(() => { getCurrentProfile(); }, [getCurrentProfile]);

  return (
    <Fragment>
      <h1 className="text-primary large">Dashboard</h1>
      <p className="lead"><i className="fas fa-user">Welcome {user && user.name}</i></p>
      {profile !== null ? 
        (<Fragment>
          <DashActions />
          <Experience experience={profile.experience} />
          <Education education={profile.education} />
        
          <div className="my-2">
            <button className="btn btn-danger" onClick={() => deleteAccount()}>
              <i className="fas fa-user-minus"></i> Delete Account
            </button>
          </div>
        </Fragment>)
        :
        (<Fragment>
          <p>Your profile is empty. You can update it below.</p>
          <Link to="/create-profile" className="btn btn-primary my-1">Create Profile</Link>
        </Fragment>)}
    </Fragment>
  );
}

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  profile: state.profile
});

export default connect(mapStateToProps, { getCurrentProfile, deleteAccount })(Dashboard);
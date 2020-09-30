import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import ProfileTop from './ProfileTop';
import ProfileAbout from './ProfileAbout';
import ProfileExperience from './ProfileExperience';
import ProfileEducation from './ProfileEducation';
//import ProfileGithub from './ProfileGithub';
import Spinner from '../layout/Spinner';
import { getProfile } from '../../actions/profile';

const Profile = ({ match, getProfile, profile: {profile, loading}, auth
}) => {
  useEffect(()=>{
    getProfile(match.params.id);
  }, [getProfile]);

  return (
    <Fragment>
      {profile === null || loading ? 
      <Spinner/>
      :
      <Fragment>
        <Link className="btn btn-light" to="/profiles">Back To Profiles</Link>

        {auth.isAuthenticated &&
        auth.loading === false &&
        auth.user._id === profile.user._id && 
        (<Link className="btn btn-dark" to="/edit-profile">Edit Profile</Link>)}

        <div className="profile-grid my-1">
          <ProfileTop profile={profile} />
          <ProfileAbout profile={profile} />

          <div className="profile-exp bg-white p-2">
            <h2 className="text-primary">Experience</h2>
            {profile.experience.length > 0 ?
            (<Fragment>
              {profile.experience.map(experience=>(
                <ProfileExperience key={experience._id} experience={experience} />
              ))}
            </Fragment>)
            :
            (<h4>No Experience</h4>)}
          </div>

          <div className="profile-edu bg-white p-2">
            <h2 className="text-primary">Education</h2>
            {profile.education.length > 0 ?
            (<Fragment>
              {profile.education.map(education=>(
                <ProfileEducation key={education._id} education={education} />
              ))}
            </Fragment>)
            :
            (<h4>No Education</h4>)}
          </div>

        </div>
      </Fragment>}
    </Fragment>
  )
}

Profile.propTypes = {
  getProfile: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  profile: state.profile,
  auth: state.auth
});

export default connect(mapStateToProps, { getProfile })(Profile);

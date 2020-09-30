import React from 'react';
import Moment from 'react-moment';
import PropTypes from 'prop-types';

const ProfileExperience = ({ experience: {
  company, title, location, to, from, description
} }) => {
  return (
    <div>
      <h3 className="text-dark">{company}</h3>
      <p>
        <Moment format="YYYY/MM/DD">{from}</Moment>
        - {!to ? "Present"
        :
        <Moment format="YYYY/MM/DD">{to}</Moment>}
      </p>
      <p><strong>Position: </strong>{title}</p>
      <p><strong>Location: </strong>{location}</p>
      <p><strong>Description: </strong>{description}</p>
    </div>
  )
}

ProfileExperience.propTypes = {
  experience: PropTypes.array.isRequired
}

export default ProfileExperience
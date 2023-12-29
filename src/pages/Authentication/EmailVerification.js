import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { emailVerification } from 'store/actions';
import { useNavigate } from 'react-router-dom';

const EmailVerification = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setError('No token provided.');
      setLoading(false);
      return;
    }

    dispatch(emailVerification(token, history));

  }, [history]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return null; // or a redirect component if needed
};

export default EmailVerification;

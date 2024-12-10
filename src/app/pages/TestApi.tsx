"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';

// use this as a template for getting json data from the backend and rendering it to the front 


export default function TestApi() {

  // Declare the state and loading state within the component

  // this one is necessary 
  const [users, setUsers] = useState<any[]>([]);

  // if you want to make a loading feature
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const fetchUsers = async () => {
      try {
        // making GET request from the relevant api route
        const response = await axios.get(`/api/test-route?id=1&name=..`);
        setUsers(response.data.users); 
     
      } catch (error) {
        console.error('Error fetching test route data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers(); 
  }, []); 

  // shows a loading message in the meantime. optional
  if (loading) return <p>Loading...</p>;

  // renders json. we use JSON.stringify to turn users object into a readable format. 
  return (
    <div className="flex-col justify-center place-items-center mx-2">
      <h1>ELibrary</h1>
      <p>{JSON.stringify(users)}</p>

    </div>
  );
}

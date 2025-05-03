import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PendingMaterialRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_URL_API}/materials?status=1`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log(response.data)
        setPendingRequests(response.data);  
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch pending requests");
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchPendingRequests();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='container-fluid rounded-top-2 box_sdw11'>
      <div className="row bg-b py-2 rounded-top-2">
        <div className="col-12 text-center text-light f_14 fw-semibold">
        Pending Material Requests
        </div>
      </div>
      {pendingRequests.length === 0 ? (
        <p>No pending requests</p>
      ) : (


        <div className="row">

        <div className='table-responsive my-4'>

    
        <table className="table table-bordered">
          <thead>
            <tr>
              <th className='bg-b text-light f_14 fw-semibold text-center'>Ticket Id</th>
              <th className='bg-b text-light f_14 fw-semibold text-center'>Project Details</th>
              <th className='bg-b text-light f_14 fw-semibold text-center'>Sheet No</th>
              <th className='bg-b text-light f_14 fw-semibold text-center'>Requirement Date</th>
              <th className='bg-b text-light f_14 fw-semibold text-center'>Delivery Place</th>
              <th className='bg-b text-light f_14 fw-semibold text-center'>Status</th>
              <th className='bg-b text-light f_14 fw-semibold text-center'>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((item, index) => (
              <tr key={item.id}> 
                <td className='text-muted f_14 fw-semibold text-center'>{item.ticket_id}</td>
                <td className='text-muted f_14 fw-semibold text-center'>{item.project_details}</td>
                <td className='text-muted f_14 fw-semibold text-center'>{item.sheet_no}</td>
                <td className='text-muted f_14 fw-semibold text-center'>{item.requirement_date}</td>
                <td className='text-muted f_14 fw-semibold text-center text-capitalize'>{item.delivery_place}</td>
                <td className='text-muted f_14 fw-semibold text-center'>{item.status_track}</td>
                <td className='text-muted f_14 fw-semibold text-center'><Link to=''><i class="fa-solid fa-eye"></i></Link></td>

              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </div>

      )}
    </div>
  );
};

export default PendingMaterialRequests;

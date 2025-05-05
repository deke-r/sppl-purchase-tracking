import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const DetailPendMaterialPurc = () => {
  const [requestData, setRequestData] = useState(null);
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksInput, setRemarksInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const ticketId = queryParams.get('ticket-id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_URL_API}/pending-material-requests/details?ticket-id=${ticketId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        setRequestData(res.data.request || {});
        setItemData(Array.isArray(res.data.items) ? res.data.items : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchData();
  }, [ticketId]);

  const handleAction = async (action) => {
    if (!remarksInput.trim()) {
      alert('Please enter remarks before proceeding.');
      return;
    }

    const currentStatus = Number(requestData.status);
    let newStatus = currentStatus;
    let newStatusTrack = '';

    if (action === 'approve') {
      if (currentStatus === 1) {
        newStatus = 2;
        newStatusTrack = 'Sent to purchase team';
      } else if (currentStatus === 2) {
        if (!selectedFile) {
          alert('Please upload a file before approving.');
          return;
        }
        newStatus = 3;
        newStatusTrack = 'Sent to management to check feedback';
      } else {
        alert('Approval not allowed for this status.');
        return;
      }
    } else if (action === 'reject') {
      newStatus = 0;
      newStatusTrack = 'Request rejected';
    }

    try {
      const formData = new FormData();
      formData.append('ticket_id', ticketId);
      formData.append('status', newStatus);
      formData.append('remarks', remarksInput);
      formData.append('status_track', newStatusTrack);

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await axios.put(
        `${import.meta.env.VITE_URL_API}/pending-material-requests/update-status`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      navigate('/dashboard/purchase/pending-material-requests');
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Something went wrong while updating status.');
    }
  };

  const DetailsSection = () => (
    <div className="container">
      {loading ? (
        Array(3).fill().map((_, idx) => (
          <div key={idx} className="row box_sdw11 br-l f_14 fw-semibold py-2 my-2">
            <div className="col-md-6"><div className="skeleton-loader" style={{ height: '1rem', width: '60%' }} /></div>
            <div className="col-md-6"><div className="skeleton-loader" style={{ height: '1rem', width: '40%' }} /></div>
          </div>
        ))
      ) : (
        <>
          <div className="row box_sdw11 br-l f_14 fw-semibold py-2 my-2">
            <div className="col-md-6">Ticket ID: <span className="text-muted">{requestData.ticket_id}</span></div>
            <div className="col-md-6">Project Details: <span className="text-muted">{requestData.project_details}</span></div>
          </div>
          <div className="row box_sdw11 br-l f_14 fw-semibold py-2 my-2">
            <div className="col-md-6">User ID: <span className="text-muted">{requestData.user_id}</span></div>
            <div className="col-md-6">Sheet No: <span className="text-muted">{requestData.sheet_no}</span></div>
          </div>
          <div className="row box_sdw11 br-l f_14 fw-semibold py-2 my-2">
            <div className="col-md-6">Requirement Date: <span className="text-muted">{requestData.requirement_date}</span></div>
            <div className="col-md-6">Delivery Place: <span className="text-muted">{requestData.delivery_place}</span></div>
          </div>
          <div className="row box_sdw11 br-l f_14 fw-semibold py-2 my-2">
            <div className="col-md-6">Created At: <span className="text-muted">{requestData.created_at}</span></div>
            <div className="col-md-6">Last Updated: <span className="text-muted">{requestData.last_updated}</span></div>
          </div>
          <div className="row box_sdw11 br-l f_14 fw-semibold py-2 my-2">
            <div className="col-md-6">Status: <span className="text-muted">{requestData.status_track}</span></div>
            {requestData.remarks && (
              <div className="col-md-6">Remarks: <span className="text-muted">{requestData.remarks}</span></div>
            )}
          </div>

          {
            requestData.attachment && (
              <div className="row box_sdw11 br-l f_14 fw-semibold py-2 my-2">
                <div className="col-md-6">
                  Attachment:{' '}
                  {requestData.attachment ? (
                    <span className="text-muted">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`${import.meta.env.VITE_URL_API}/uploads/${requestData.attachment}`}
                      >
                               <span className='ms-2'>
                    <i class="fa-solid fa-file-pdf f_16 text-danger"></i>
                        </span>
                      </a>
                    </span>
                  ) : (
                    <span className="text-muted">No attachment</span>
                  )}
                </div>

              </div>
            )
          }
        </>
      )}
    </div>
  );

  const TableSection = () => (
    <div className="container-fluid mt-5 box_sdw11">
      <div className="row bg-b py-2">
        <div className="col-12 text-center text-light f_14 fw-semibold">Material Details</div>
      </div>
      <div className="table-responsive my-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              {['ID', 'Description', 'UOM', 'Quantity', 'Make', 'Created At'].map(h => (
                <th key={h} className="bg-b text-light f_14 fw-semibold text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill().map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array(6).fill().map((__, colIndex) => (
                    <td key={colIndex} className="text-center">
                      <div className="skeleton-loader" style={{ height: '1rem', width: '80%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              itemData.map((item) => (
                <tr key={item.id}>
                  <td className="text-muted f_14 fw-semibold text-center">{item.id}</td>
                  <td className="text-muted f_14 fw-semibold text-center">{item.description}</td>
                  <td className="text-muted f_14 fw-semibold text-center">{item.uom}</td>
                  <td className="text-muted f_14 fw-semibold text-center">{item.quantity}</td>
                  <td className="text-muted f_14 fw-semibold text-center">{item.make}</td>
                  <td className="text-muted f_14 fw-semibold text-center">{item.created_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <DetailsSection />
      <TableSection />

      <div className="container-fluid box_sdw11 my-4">
        <div className="row bg-b">
          <div className="col-md-12 text-light py-2 f_14 fw-semibold text-center">Action</div>
        </div>
        <div className="row">
          <div className="col-md-6">
            {requestData && Number(requestData.status) === 2 && (
              <div className="mt-2">
                <label htmlFor="file" className="f_14 fw-semibold">
                  <span className="text-danger">*</span> Upload Feedback :
                </label>
                <input
                  type="file"
                  name="file"
                  className="form-control my-2 br-l rounded-0"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept='.pdf'
                />
              </div>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 d-flex justify-content-center my-2">
            <textarea
              className="form-control rounded-0 br-l f_14 fw-semibold text-muted"
              placeholder="remarks .."
              value={remarksInput}
              onChange={(e) => setRemarksInput(e.target.value)}
            />
          </div>
          <div className="col-md-6 my-2">
            <div className="row my-2 d-flex justify-content-center">
              <div className="btn bg-b f_14 fw-semibold text-light rounded-0 w-75"
                   onClick={() => handleAction('approve')}>
                Approve
              </div>
            </div>
            <div className="row my-2 d-flex justify-content-center">
              <div className="btn bg-danger f_14 fw-semibold text-light rounded-0 w-75"
                   onClick={() => handleAction('reject')}>
                Reject
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPendMaterialPurc;

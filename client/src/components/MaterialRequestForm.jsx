import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useForm, Controller } from "react-hook-form";

const MaterialRequestForm = () => {
  const [managers, setManagers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [formValues, setFormValues] = useState({
    description: '',
    uom: '',
    quantity: '',
    make: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_URL_API}/managers`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const managerOptions = res.data.map(manager => ({
          value: manager.email,
          label: manager.designation,
        }));
        setManagers(managerOptions);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMaterial = () => {
    const { description, uom, quantity, make } = formValues;
    if (description && uom && quantity && make) {
      setMaterials(prev => [...prev, formValues]);
      setFormValues({ description: '', uom: '', quantity: '', make: '' });
    } else {
      setMessage("Please fill all fields");
      setMessageType("error");
      setTimeout(() => setMessage(''), 4000); 
    }
  };

  const handleRemove = (index) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (materials.length === 0) {
      setMessage("Please add at least one material.");
      setMessageType("error");
      setTimeout(() => setMessage(''), 4000);
      return;
    }

    setLoading(true);

    const finalData = {
      ...data,
      materials: materials,
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_URL_API}/material-request`, finalData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setMessage("Material request submitted successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(''), 4000);
      setTimeout(()=>{
        location.reload()
      },4000)
    } catch (error) {
      console.error('Submission error:', error);
      setMessage("Failed to submit the request.");
      setMessageType("error");
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container-fluid my-5">
      {message && (
        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} mt-3  w-md-25`} role="alert" style={{
          position:'absolute',
          right: 12,
    top: 55
        }}>
          {message}
        </div>
      )}
      <div className="row mx-md-5 px-md-5">
        <div className="container pb-4 box_sdw11">
          <div className="row bg-b text-center text-light rounded-top-2 f_16 fw-semibold py-2">
            <div className="col-12">Material Request Form</div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6 my-2">
              <label className="form-label fw-semibold text-dark">Project Details :</label>
              <input
                type="text"
                name="projectDetails"
                className="form-control text-muted f_16 py-2 bg-light fw-semibold rounded-0 br-l"
                placeholder="Enter project details"
                {...register("projectDetails", { required: "Project details are required" })}
              />
              {errors.projectDetails && <span className="text-danger">{errors.projectDetails.message}</span>}
            </div>
            <div className="col-md-6 my-2">
              <label className="form-label fw-semibold text-dark">Select Managers :</label>
              <Controller
                name="managers"
                control={control}
                rules={{ required: "Manager selection is required" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={managers}
                    isMulti
                    className="react-select-container text-capitalize text-muted bg-light f_16 fw-semibold br-l rounded-0"
                    classNamePrefix="react-select"
                    placeholder="Select Project Managers"
                  />
                )}
              />
              {errors.managers && <span className="text-danger">{errors.managers.message}</span>}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 my-2">
              <label className="form-label fw-semibold text-dark">Date :</label>
              <input
                type="date"
                className="form-control text-muted f_16 py-2 bg-light fw-semibold rounded-0 br-l"
                value={new Date().toISOString().split('T')[0]}
                min={new Date().toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                readOnly
              />
            </div>
            <div className="col-md-6 my-2">
              <label className="form-label fw-semibold text-dark">Sheet No :</label>
              <input
                type="text"
                className="form-control text-muted f_16 py-2 bg-light fw-semibold rounded-0 br-l"
                placeholder="Enter sheet number"
                {...register("sheetNo", { required: "Sheet number is required" })}
              />
              {errors.sheetNo && <span className="text-danger">{errors.sheetNo.message}</span>}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 my-2">
              <label className="form-label fw-semibold text-dark">Requirement Date :</label>
              <input
                type="date"
                className="form-control text-muted f_16 bg-light py-2 fw-semibold rounded-0 br-l"
                {...register("requirementDate", { required: "Requirement date is required" })}
              />
              {errors.requirementDate && <span className="text-danger">{errors.requirementDate.message}</span>}
            </div>
            <div className="col-md-6 my-2">
              <label className="form-label fw-semibold text-dark">Delivery Place :</label>
              <input
                type="text"
                className="form-control text-muted f_16 py-2 bg-light fw-semibold rounded-0 br-l"
                placeholder="Enter delivery location"
                {...register("deliveryPlace", { required: "Delivery place is required" })}
              />
              {errors.deliveryPlace && <span className="text-danger">{errors.deliveryPlace.message}</span>}
            </div>
          </div>

          <hr className="mt-form-hr" />

          <div className="row">
            <div className="col-md-6 col-lg-3 my-2">
              <label className="form-label fw-semibold text-dark">Material Description :</label>
              <input
                type="text"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                className="form-control text-muted f_16 py-2 bg-light fw-semibold rounded-0 br-l"
                placeholder="Material Description"
              />
            </div>
            <div className="col-md-6 col-lg-2 my-2">
              <label className="form-label fw-semibold text-dark">Add UOM :</label>
              <input
                type="text"
                name="uom"
                value={formValues.uom}
                onChange={handleInputChange}
                className="form-control text-muted f_16 py-2 bg-light fw-semibold rounded-0"
                placeholder="UOM"
              />
            </div>
            <div className="col-md-6 col-lg-2 my-2">
              <label className="form-label fw-semibold text-dark">Add Quantity :</label>
              <input
                type="number"
                name="quantity"
                value={formValues.quantity}
                onChange={handleInputChange}
                className="form-control text-muted f_16 py-2 bg-light fw-semibold rounded-0"
                placeholder="Quantity"
              />
            </div>
            <div className="col-md-6 col-lg-3 my-2">
              <label className="form-label fw-semibold text-dark">Add Make / Cat No. / Model :</label>
              <input
                type="text"
                name="make"
                value={formValues.make}
                onChange={handleInputChange}
                className="form-control text-muted f_16 py-2 bg-light fw-semibold rounded-0"
                placeholder="Make / Cat No. / Model"
              />
            </div>
            <div className="col-md-6 col-lg-2 my-2">
              <label className="form-label fw-semibold text-dark">&nbsp;</label>
              <button className="btn bg-b f_16 fw-semibold text-light w-100 py-2 rounded-0" type="button" onClick={handleAddMaterial}>
                Add
              </button>
            </div>
          </div>

          {materials.length > 0 && (
            <div>
              <div className="table-responsive mt-4">
                <table className="table table-bordered">
                  <thead className="table-secondary text-center">
                    <tr>
                      <th className="text-dark f_16 fw-semibold text-nowrap">S. No.</th>
                      <th className="text-dark f_16 fw-semibold text-nowrap">Description</th>
                      <th className="text-dark f_16 fw-semibold text-nowrap">UOM</th>
                      <th className="text-dark f_16 fw-semibold text-nowrap">Quantity</th>
                      <th className="text-dark f_16 fw-semibold text-nowrap">Make / Cat No. / Model</th>
                      <th className="text-dark f_16 fw-semibold text-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {materials.map((item, index) => (
                      <tr key={index}>
                        <td className="text-muted f_16 fw-semibold">{index + 1}</td>
                        <td className="text-muted f_16 fw-semibold">{item.description}</td>
                        <td className="text-muted f_16 fw-semibold">{item.uom}</td>
                        <td className="text-muted f_16 fw-semibold">{item.quantity}</td>
                        <td className="text-muted f_16 fw-semibold">{item.make}</td>
                        <td>
                          <button className="btn btn-sm btn-danger f_16 fw-semibold" onClick={() => handleRemove(index)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="container px-0">
                <div className="row px-0">
                  <div className="col-md-12">
                    <button type="submit" className="btn bg-b text-light rounded-0 w-100 f_16 fw-semibold">
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default MaterialRequestForm;

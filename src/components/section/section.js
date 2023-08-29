import 'bootstrap/dist/css/bootstrap.css';
import "./section.css";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Section = () => {

    const [sectors, setSectors] = useState([]);
    const [dataAlreadyLoaded, setDataAlreadyLoaded] = useState(false);
    const [updateButtonDisabled, setUpdateButtonDisabled] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        sectorId: '',
        agreeToTerms: false,
        id: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        sectorId: '',
        agreeToTerms: ''
    });
    const [validated, setValidated] = useState(false);
    const formRef = useRef(null);
    
    useEffect(() => {
        axios.get('http://test-app-rho-gilt.vercel.app/api/sectors')
            .then(response => {
                setSectors(response.data);
            })
            .catch(error => {
                console.error('Error fetching sectors:', error);
            });
    }, []);

    useEffect(() => {
        const clearSessionStorage = () => {
            sessionStorage.removeItem('hasLoadedData');
        };

        window.addEventListener('beforeunload', clearSessionStorage);

        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('beforeunload', clearSessionStorage);
        };
    }, []);

    useEffect(() => {
        const hasLoadedData = sessionStorage.getItem('hasLoadedData');
        if (!hasLoadedData) {
            setDataAlreadyLoaded(true); // Set to false if data hasn't been loaded
        }
    }, []); // Run this effect only once, when the component mounts

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            name: '',
            sectorId: '',
            agreeToTerms: ''
        };

        if (formData.name.trim() === '') {
            newErrors.name = 'Name is required';
            valid = false;
        }
        if (formData.sectorId === '') {
            newErrors.sectorId = 'Sector selection is required';
            valid = false;
        }
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'Agree to terms is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        setFormData({
            ...formData,
            [name]: value
        });

        setErrors({
            ...errors,
            [name]: ''
        });
    }

    const handleReset = () => {
        setFormData({
            name: '',
            sectorId: '',
            agreeToTerms: false
        });
        setErrors({
            name: '',
            sectorId: '',
            agreeToTerms: ''
        });
        setValidated(false);
    
        // Clear the flag from local storage
        sessionStorage.removeItem('hasLoadedData');
        setUpdateButtonDisabled(true); // Disable the "Update" button
    };
    

    const loadData = () => {
        const hasLoadedData = sessionStorage.getItem('hasLoadedData'); // Use sessionStorage instead of localStorage

        if (!hasLoadedData) {
            axios.get('https://test-app-rho-gilt.vercel.app/api/latest-user-data')
                .then(response => {
                    console.log("Latest user data loaded:", response.data);
                    const userData = response.data;
                    const selectedSector = sectors.find(sector => sector.sector_name === userData.sector_name);
                    const sectorId = selectedSector ? selectedSector.id : '';
    
                    setFormData({
                        id: userData.id,
                        name: userData.name,
                        sectorId: sectorId,
                        agreeToTerms: userData.agree_to_terms
                    });
                    console.log('User ID from response:', userData.id);
                    // Set the flag in local storage
                    sessionStorage.setItem('hasLoadedData', 'true');
                    setDataAlreadyLoaded(true);
                    setSuccessMessage('Successfully loaded!');
                    setUpdateButtonDisabled(false); // Enable the "Update" button
                })
                .catch(error => {
                    console.error('Error fetching latest user data:', error);
                });
        }else {
            // Data already loaded, show a message
            setDataAlreadyLoaded(false);
        }
    };
    
    const updateData = () => {
        const formPayload = {
            name: formData.name,
            sector_name: sectors.find(sector => sector.id === parseInt(formData.sectorId)).sector_name,
            agree_to_terms: formData.agreeToTerms,
            userId: formData.id
        };
        console.log(formPayload.userId)
        console.log('formData before update call:', formData);
         // Extract user ID from formData
        axios.put(`https://test-app-rho-gilt.vercel.app/api/update-user-data/${formPayload.userId}`, formPayload, {headers: {
            'Content-Type': 'application/json'
          }})
            .then(response => {
                console.log('User data updated:', response.data);
                // You might want to reload the data here or update the UI in some way
                setSuccessMessage('Successfully updated!');
                sessionStorage.removeItem('hasLoadedData');
            })
            .catch(error => {
                console.error('Error updating user data:', error);
            });
        handleReset();
    }

   const handleSubmit = (event) => {
    event.preventDefault();

    if (validateForm()) {
        setValidated(true);

        const formPayload = {
            name: formData.name,
            sector_name: sectors.find(sector => sector.id === parseInt(formData.sectorId)).sector_name,
            agree_to_terms: formData.agreeToTerms
        };
            // If no user data was loaded, perform an insert operation
            axios.post('https://test-app-rho-gilt.vercel.app/details/add', formPayload)
                .then(response => {
                    console.log('Form data submitted:', response.data);
                    sessionStorage.setItem('hasLoadedData', 'true');
                })
                .catch(error => {
                    console.error('Error submitting form data:', error);
                });
    } else {
        setValidated(false);
    }
    setDataAlreadyLoaded(false);
    setSuccessMessage('Successfully submitted!');
    handleReset();
};

    

    return (
        <div className="section-container">
            <form className={`section-form ${validated ? 'was-validated' : ''} `} ref={formRef} onSubmit={handleSubmit}>
                <h2 className='pt-4'>Join Our Team</h2>
                <p className='py-3 text-bold'>Please enter your name and pick the Sectors you are currently involved in.</p>
                <div className="form-group">
                    <label htmlFor="name" className='pb-2'>Name</label>
                    <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="sector" className='pb-1'>Select Sectors</label>
                    <select className="form-select" size="5" aria-label="size 3 select example" name="sectorId" value={formData.sectorId} onChange={handleInputChange} required>
                        {sectors.map(sector => (
                            <option key={sector.id} value={sector.id}>
                                {Array(sector.space_value).fill('\u00a0').join('')}{sector.sector_name}
                            </option>
                        ))}
                    </select>
                    {errors.sectorId && <div className="error-message">{errors.sectorId}</div>}
                </div>

                <div className="form-check pb-3">
                    <input className="form-check-input" type="checkbox" value="" id="agreeToTerms" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} required />
                    <label className="form-check-label" htmlFor="flexCheckDefault">Agree to terms</label>
                    {errors.agreeToTerms && <div className="error-message">{errors.agreeToTerms}</div>}
                </div>
                <div className="row pt-2 pb-2">
                    <div className='col-xl-4 col-sm-12 col-md-12 col-lg-4 mt-2'>
                        <button className="btn btnColor btn-block" type="submit">Save</button>
                    </div>
                    <div className='col-xl-4 col-sm-12 col-md-12 col-lg-4 mt-2'>
                        <button className="btn btnColor btn-block" type="button" disabled={dataAlreadyLoaded} onClick={loadData}>Load Data</button>
                    </div>
                    <div className='col-xl-4 col-sm-12 col-md-12 col-lg-4 mt-2'>
                        <button className="btn btnColor btn-block" type="button"  disabled={updateButtonDisabled} onClick={updateData}>Update</button>
                    </div>
                </div>
                <div className='pt-4'>
                {successMessage && <div className="success-message">{successMessage}</div>}
                </div>
            </form>
        </div>
    );
}

export default Section;
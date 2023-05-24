import React, { useState } from "react";

const Card = ({ title, addressLabel, reserves, onSubmit }) => {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [selectedReserve, setSelectedReserve] = useState("");


  const handleChange1 = (event) => {
    setValue1(event.target.value);
  };

  const handleChange2 = (event) => {
    setValue2(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit( selectedReserve, value1, value2);
  };

  const getReserveAddress = (reserveSymbol) => {
    const address = reserves.filter(reserve => reserve.symbol === reserveSymbol)[0].tokenAddress
    setSelectedReserve(address)
  }

  return (
    <div className="card font-mono w-1/2 p-3 bg-slate-400">
      <div className="card-header">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="card-body mt-3">
        <div className="form-group">
          <label htmlFor="address">{addressLabel}</label>
          <input
            type="text"
            className="form-control w-1/2 mb-2 mx-2"
            id="address"
            value={value1}
            onChange={handleChange1}
          />
        </div>
        <div className="form-group">
          <label htmlFor="number">Amount</label>
          <input
            type="number"
            className="form-control w-1/2 mb-2 mx-2"
            id="number"
            value={value2}
            onChange={handleChange2}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reserve" className="mr-3">Reserve</label>
          <select name="reserve" onChange={(event) => getReserveAddress(event.target.value)}>
            <option value="">Select Reserve</option>
            {reserves.map((reserve) => (
              <option value={reserve.symbol} key={reserve.id}>{reserve.symbol}</option>
            ))}
          </select>  
        </div>
        

        <p> Reserve Address: {selectedReserve}</p>
        <button
          type="submit"
          className="bg-red-500"
          onClick={handleSubmit}
        >
          Submit
        </button>


      </div>
    </div>
  );
};

export default Card;
